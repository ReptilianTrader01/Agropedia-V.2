// Agropedia V2 - motor determinista de recomendaciones
'use strict';

(() => {
    const db = window.agropediaSupabase;
    const BLOCK_SIZE = 5;

    const SCORE = {
        climate: 3,
        soil: 2,
        light: 2,
        cycle: 1,
        family: 1,
        irrigation: 1,
        sowing: 1,
        compatibility: 4,
        favoriteRelation: 3
    };

    function normalize(value) {
        return (value ?? '')
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function sameValue(a, b) {
        const left = normalize(a);
        const right = normalize(b);
        return Boolean(left && right && left === right);
    }

    function sortById(plants) {
        return [...plants].sort((a, b) => Number(a.id) - Number(b.id));
    }

    function rotateColdStart(plants, date = new Date()) {
        const ordered = sortById(plants);
        if (!ordered.length) return [];

        const dayNumber = Math.floor(
            Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
        );
        const start = ((dayNumber % ordered.length) + ordered.length) % ordered.length;

        return Array.from(
            { length: Math.min(BLOCK_SIZE, ordered.length) },
            (_, index) => ordered[(start + index) % ordered.length]
        );
    }

    function relationKey(leftId, rightId) {
        return Number(leftId) + ':' + Number(rightId);
    }

    function buildCompatibilityMap(rows) {
        const map = new Map();

        (rows || []).forEach(row => {
            if (!row?.compatible || row.planta_id == null || row.planta_relacionada_id == null) {
                return;
            }

            map.set(relationKey(row.planta_id, row.planta_relacionada_id), row);
        });

        return map;
    }

    function explicitCompatibility(candidateId, referenceId, compatibilityMap) {
        return compatibilityMap.get(relationKey(referenceId, candidateId))
            || compatibilityMap.get(relationKey(candidateId, referenceId))
            || null;
    }

    function plantSimilarity(candidate, reference) {
        const reasons = [];
        let score = 0;

        if (sameValue(candidate.clima_preferido, reference.clima_preferido)) {
            score += SCORE.climate;
            reasons.push('comparte clima preferido');
        }

        if (sameValue(candidate.suelo_preferido, reference.suelo_preferido)) {
            score += SCORE.soil;
            reasons.push('comparte suelo preferido');
        }

        if (sameValue(candidate.luz, reference.luz)) {
            score += SCORE.light;
            reasons.push('comparte condiciones de luz');
        }

        if (sameValue(candidate.ciclo, reference.ciclo)) {
            score += SCORE.cycle;
            reasons.push('comparte ciclo');
        }

        if (
            candidate.familia_id != null
            && reference.familia_id != null
            && Number(candidate.familia_id) === Number(reference.familia_id)
        ) {
            score += SCORE.family;
            reasons.push('comparte familia');
        }

        if (sameValue(candidate.riego, reference.riego)) {
            score += SCORE.irrigation;
            reasons.push('comparte riego');
        }

        if (sameValue(candidate.epoca_siembra, reference.epoca_siembra)) {
            score += SCORE.sowing;
            reasons.push('comparte época de siembra');
        }

        return { score, reasons };
    }

    function climateMatch(candidate, preferredClimate) {
        if (!preferredClimate || !candidate.clima_preferido) {
            return { score: 0, reason: null };
        }

        if (sameValue(candidate.clima_preferido, preferredClimate)) {
            return {
                score: SCORE.climate,
                reason: 'coincide con tu clima preferido'
            };
        }

        return { score: 0, reason: null };
    }

    function reasonText(reasons) {
        const clean = [...new Set(reasons.filter(Boolean))];

        if (!clean.length) {
            return 'Forma parte del catálogo disponible para explorar.';
        }

        if (clean.length === 1) {
            return 'Porque ' + clean[0] + '.';
        }

        if (clean.length === 2) {
            return 'Porque ' + clean[0] + ' y ' + clean[1] + '.';
        }

        return 'Porque ' + clean.slice(0, 2).join(', ') + ' y otros datos coinciden.';
    }

    function createCandidate(plant) {
        return {
            plant,
            score: 0,
            reasons: [],
            referenceIds: new Set()
        };
    }

    function addCandidate(map, plant) {
        const key = Number(plant.id);

        if (!map.has(key)) {
            map.set(key, createCandidate(plant));
        }

        return map.get(key);
    }

    function rankCandidates(candidates) {
        return [...candidates]
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return Number(a.plant.id) - Number(b.plant.id);
            })
            .slice(0, BLOCK_SIZE);
    }

    function buildPersonalizedPlants(plants, context) {
        const cultivatedIds = new Set(context.cultivatedIds);
        const candidates = new Map();

        plants.forEach(plant => {
            if (cultivatedIds.has(Number(plant.id))) {
                return;
            }

            const candidate = addCandidate(candidates, plant);

            if (context.preferredClimate) {
                const climate = climateMatch(plant, context.preferredClimate);
                candidate.score += climate.score;

                if (climate.reason) {
                    candidate.reasons.push(climate.reason);
                }
            }

            context.favorites.forEach(favorite => {
                if (Number(favorite.id) === Number(plant.id)) {
                    return;
                }

                const similarity = plantSimilarity(plant, favorite);
                const compatibility = explicitCompatibility(
                    plant.id,
                    favorite.id,
                    context.compatibilityMap
                );

                if (similarity.score > 0) {
                    candidate.score += similarity.score;
                    candidate.reasons.push(
                        'comparte características con ' + favorite.nombre_comun
                    );
                }

                if (compatibility) {
                    candidate.score += SCORE.compatibility;
                    candidate.reasons.push(
                        'tiene una relación de compatibilidad registrada con ' + favorite.nombre_comun
                    );
                }

                if (similarity.score > 0 || compatibility) {
                    candidate.score += SCORE.favoriteRelation;
                    candidate.referenceIds.add(Number(favorite.id));
                }
            });

            if (context.cultivated.length >= 2) {
                context.cultivated.forEach(cultivated => {
                    if (Number(cultivated.id) === Number(plant.id)) {
                        return;
                    }

                    const similarity = plantSimilarity(plant, cultivated);

                    if (similarity.score > 0) {
                        candidate.score += similarity.score;
                        candidate.reasons.push(
                            'comparte características con ' + cultivated.nombre_comun + ', que ya cultivas'
                        );
                        candidate.referenceIds.add(Number(cultivated.id));
                    }
                });
            }
        });

        return rankCandidates(
            [...candidates.values()].filter(item => item.score > 0)
        ).map(item => ({
            ...item.plant,
            recommendationScore: item.score,
            recommendationReason: reasonText(item.reasons)
        }));
    }

    function buildGeneralPlants(plants, excludedIds = []) {
        const excluded = new Set(excludedIds.map(Number));

        return sortById(plants)
            .filter(plant => !excluded.has(Number(plant.id)))
            .slice(0, BLOCK_SIZE)
            .map(plant => ({
                ...plant,
                recommendationScore: 0,
                recommendationReason: 'Forma parte del catálogo disponible para explorar.'
            }));
    }

    function buildColdStartPlants(plants, date = new Date()) {
        return rotateColdStart(plants, date).map(plant => ({
            ...plant,
            recommendationScore: 0,
            recommendationReason: 'Forma parte del catálogo disponible y entra en el bloque rotativo de hoy.'
        }));
    }

    async function loadContext() {
        const context = {
            user: null,
            favoriteIds: [],
            favorites: [],
            cultivatedIds: [],
            cultivated: [],
            preferredClimate: null,
            compatibilityMap: new Map()
        };

        const { data: authData } = await db.auth.getUser();
        context.user = authData?.user || null;

        if (!context.user) {
            return context;
        }

        const [favoritesResult, cultivatedResult, preferencesResult, compatibilityResult] = await Promise.all([
            db
                .from('plantas_favoritas')
                .select('planta_id')
                .eq('usuario_id', context.user.id),

            db
                .from('plantas_bancal')
                .select('planta_id')
                .not('planta_id', 'is', null),

            db
                .from('preferencias_usuario')
                .select('clima_preferido')
                .eq('usuario_id', context.user.id)
                .maybeSingle(),

            db
                .from('plantas_compatibles')
                .select('planta_id,planta_relacionada_id,compatible,descripcion')
        ]);

        if (favoritesResult.error) {
            console.error('Error al cargar favoritos para recomendaciones:', favoritesResult.error);
        }

        if (cultivatedResult.error) {
            console.error('Error al cargar plantas cultivadas para recomendaciones:', cultivatedResult.error);
        }

        if (preferencesResult.error) {
            console.error('Error al cargar preferencias para recomendaciones:', preferencesResult.error);
        }

        if (compatibilityResult.error) {
            console.error('Error al cargar compatibilidades para recomendaciones:', compatibilityResult.error);
        }

        context.favoriteIds = [...new Set(
            (favoritesResult.data || [])
                .map(row => Number(row.planta_id))
                .filter(Number.isFinite)
        )];

        context.cultivatedIds = [...new Set(
            (cultivatedResult.data || [])
                .map(row => Number(row.planta_id))
                .filter(Number.isFinite)
        )];

        context.preferredClimate = preferencesResult.data?.clima_preferido || null;
        context.compatibilityMap = buildCompatibilityMap(compatibilityResult.data || []);

        return context;
    }

    function enrichContextPlants(context, plants) {
        const byId = new Map(plants.map(plant => [Number(plant.id), plant]));

        context.favorites = context.favoriteIds
            .map(id => byId.get(id))
            .filter(Boolean);

        context.cultivated = context.cultivatedIds
            .map(id => byId.get(id))
            .filter(Boolean);
    }

    async function getRecommendations() {
        const { data: plants, error } = await db
            .from('plantas')
            .select(
                'id,nombre_comun,nombre_cientifico,descripcion,imagen_url,clima_preferido,suelo_preferido,luz,ciclo,dificultad,familia_id,epoca_siembra,riego,tipo_cultivo'
            )
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        const catalog = plants || [];
        const context = await loadContext();
        enrichContextPlants(context, catalog);

        const hasPersonalSignal = Boolean(
            context.favorites.length
            || context.preferredClimate
            || context.cultivated.length >= 2
        );

        if (!hasPersonalSignal) {
            const hasSingleCultivatedPlant = context.cultivated.length === 1;

            if (hasSingleCultivatedPlant) {
                return {
                    mode: 'general',
                    title: 'Descubrimiento para tu huerto',
                    description: 'Aún no tenemos suficientes señales para personalizar estas recomendaciones. Puedes explorar el catálogo sin asumir condiciones de tu huerto.',
                    invitation: 'Agrega plantas a favoritos o configura tu clima preferido para recibir recomendaciones más personalizadas.',
                    plants: buildGeneralPlants(catalog, context.cultivatedIds)
                };
            }

            return {
                mode: 'cold-start',
                title: 'Recomendaciones para empezar',
                description: 'Todavía no tenemos suficientes datos sobre tus intereses o tu huerto. Estas son algunas plantas del catálogo para que puedas explorar.',
                invitation: 'Agrega plantas a favoritos o configura tu clima preferido para recibir recomendaciones más personalizadas.',
                plants: buildColdStartPlants(catalog)
            };
        }

        const recommendations = buildPersonalizedPlants(catalog, context);

        if (!recommendations.length) {
            return {
                mode: 'general-fallback',
                title: 'Descubrimiento para tu huerto',
                description: 'No encontramos suficientes coincidencias confirmadas para personalizar las recomendaciones. Mostramos otras plantas del catálogo sin asumir preferencias que no están registradas.',
                invitation: context.favorites.length
                    ? null
                    : 'Agrega plantas a favoritos para que el sistema pueda conocer mejor tus intereses.',
                plants: buildGeneralPlants(catalog, context.cultivatedIds),
                context
            };
        }

        return {
            mode: 'personalized',
            title: 'Plantas recomendadas para ti',
            description: 'Estas recomendaciones se ordenan usando únicamente los datos disponibles sobre tus favoritos, tu huerto y tus preferencias.',
            invitation: context.favorites.length
                ? null
                : 'Agrega plantas a favoritos para que el sistema pueda conocer mejor tus intereses.',
            plants: recommendations,
            context
        };
    }

    window.agropediaRecommendations = {
        getRecommendations,
        buildColdStartPlants,
        buildPersonalizedPlants,
        normalize,
        BLOCK_SIZE
    };
})();
