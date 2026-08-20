(() => {
    'use strict';

    // =========================================================
    // CONFIGURACIÓN LOCAL
    // =========================================================

    const STORAGE_KEY = 'agropedia_demo_users';
    const SESSION_KEY = 'agropedia_demo_session';


    // =========================================================
    // ELEMENTOS
    // =========================================================

    const tabs = document.querySelectorAll('[data-auth-tab]');
    const panels = {
        login: document.getElementById('login-panel'),
        register: document.getElementById('register-panel')
    };

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    const passwordStrength = document.getElementById('password-strength');
    const passwordStrengthText = document.getElementById('password-strength-text');


    // =========================================================
    // CAMBIAR ENTRE LOGIN Y REGISTRO
    // =========================================================

    function showAuthPanel(panelName) {
        tabs.forEach(tab => {
            const isActive = tab.dataset.authTab === panelName;

            tab.classList.toggle('is-active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });

        Object.entries(panels).forEach(([name, panel]) => {
            const isActive = name === panelName;

            panel.hidden = !isActive;
            panel.classList.toggle('is-active', isActive);
        });

        clearMessages();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            showAuthPanel(tab.dataset.authTab);
        });
    });


    // =========================================================
    // CONTRASEÑAS: MOSTRAR / OCULTAR
    // =========================================================

    document.querySelectorAll('[data-toggle-password]').forEach(button => {
        button.addEventListener('click', () => {
            const inputId = button.dataset.togglePassword;
            const input = document.getElementById(inputId);

            if (!input) {
                return;
            }

            const shouldShow = input.type === 'password';

            input.type = shouldShow ? 'text' : 'password';
            button.textContent = shouldShow ? '🙈' : '👁';
            button.setAttribute(
                'aria-label',
                shouldShow ? 'Ocultar contraseña' : 'Mostrar contraseña'
            );
        });
    });


    // =========================================================
    // FORTALEZA DE CONTRASEÑA
    // =========================================================

    function getPasswordStrength(password) {
        let score = 0;

        if (password.length >= 8) {
            score++;
        }

        if (/[A-Z]/.test(password)) {
            score++;
        }

        if (/[0-9]/.test(password)) {
            score++;
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score++;
        }

        return score;
    }

    function updatePasswordStrength(password) {
        const strength = getPasswordStrength(password);

        passwordStrength.className = 'password-strength';

        if (strength > 0) {
            passwordStrength.classList.add(`level-${strength}`);
        }

        const messages = [
            'Usa al menos 8 caracteres.',
            'Contraseña débil.',
            'Contraseña aceptable.',
            'Contraseña fuerte.',
            'Contraseña muy fuerte.'
        ];

        passwordStrengthText.textContent = messages[strength];
    }

    document
        .getElementById('register-password')
        .addEventListener('input', event => {
            updatePasswordStrength(event.target.value);
        });


    // =========================================================
    // VALIDACIÓN
    // =========================================================

    function setFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const error = document.querySelector(`[data-error-for="${fieldId}"]`);

        if (field) {
            field.classList.toggle('is-invalid', Boolean(message));
        }

        if (error) {
            error.textContent = message;
        }
    }

    function clearFieldErrors(form) {
        form.querySelectorAll('.is-invalid').forEach(field => {
            field.classList.remove('is-invalid');
        });

        form.querySelectorAll('.field-error').forEach(error => {
            error.textContent = '';
        });
    }

    function isPhone(value) {
        const digits = value.replace(/\D/g, '');

        return digits.length >= 10 && digits.length <= 15;
    }

    function isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isValidContact(value) {
        return isEmail(value) || isPhone(value);
    }


    // =========================================================
    // MENSAJES
    // =========================================================

    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `form-message ${type}`;
    }

    function clearMessages() {
        [loginMessage, registerMessage].forEach(message => {
            message.textContent = '';
            message.className = 'form-message';
        });
    }


    // =========================================================
    // USUARIOS LOCALES DE PRUEBA
    // =========================================================
    // IMPORTANTE:
    // Esto NO es autenticación real.
    // Solo permite probar el diseño y las funciones mientras
    // Agropedia V2 todavía no utiliza una base de datos.

    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }


    // =========================================================
    // REGISTRO
    // =========================================================

    registerForm.addEventListener('submit', event => {
        event.preventDefault();

        clearFieldErrors(registerForm);
        registerMessage.textContent = '';
        registerMessage.className = 'form-message';

        const name = document.getElementById('register-name').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const contact = document.getElementById('register-contact').value.trim();
        const password = document.getElementById('register-password').value;
        const zone = document.getElementById('register-zone').value;
        const terms = document.getElementById('register-terms').checked;

        let isValid = true;

        if (name.length < 2) {
            setFieldError(
                'register-name',
                'Escribe tu nombre.'
            );
            isValid = false;
        }

        if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username)) {
            setFieldError(
                'register-username',
                'Usa entre 3 y 20 caracteres: letras, números, punto, guion o guion bajo.'
            );
            isValid = false;
        }

        if (!isValidContact(contact)) {
            setFieldError(
                'register-contact',
                'Introduce un correo válido o un número de teléfono.'
            );
            isValid = false;
        }

        if (password.length < 8) {
            setFieldError(
                'register-password',
                'La contraseña debe tener al menos 8 caracteres.'
            );
            isValid = false;
        }

        if (!zone) {
            setFieldError(
                'register-zone',
                'Selecciona tu zona climática.'
            );
            isValid = false;
        }

        if (!terms) {
            setFieldError(
                'register-terms',
                'Debes aceptar los términos para continuar.'
            );
            isValid = false;
        }

        if (!isValid) {
            showMessage(
                registerMessage,
                'Revisa los campos marcados antes de continuar.',
                'error'
            );
            return;
        }

        const users = getUsers();
        const normalizedUsername = username.toLowerCase();
        const normalizedContact = contact.toLowerCase();

        const existingUser = users.find(user =>
            user.username.toLowerCase() === normalizedUsername ||
            user.contact.toLowerCase() === normalizedContact
        );

        if (existingUser) {
            showMessage(
                registerMessage,
                'Ese nombre de usuario o medio de contacto ya está registrado.',
                'error'
            );
            return;
        }

        users.push({
            id: Date.now(),
            name,
            username,
            contact,
            password,
            zone,
            createdAt: new Date().toISOString()
        });

        saveUsers(users);

        registerForm.reset();
        updatePasswordStrength('');

        showMessage(
            registerMessage,
            'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
            'success'
        );

        setTimeout(() => {
            showAuthPanel('login');
            document.getElementById('login-identifier').value = username;
        }, 900);
    });


    // =========================================================
    // LOGIN
    // =========================================================

    loginForm.addEventListener('submit', event => {
        event.preventDefault();

        clearFieldErrors(loginForm);
        loginMessage.textContent = '';
        loginMessage.className = 'form-message';

        const identifier = document
            .getElementById('login-identifier')
            .value
            .trim();

        const password = document.getElementById('login-password').value;

        let isValid = true;

        if (!identifier) {
            setFieldError(
                'login-identifier',
                'Introduce tu usuario, correo o teléfono.'
            );
            isValid = false;
        }

        if (!password) {
            setFieldError(
                'login-password',
                'Introduce tu contraseña.'
            );
            isValid = false;
        }

        if (!isValid) {
            showMessage(
                loginMessage,
                'Completa los campos para iniciar sesión.',
                'error'
            );
            return;
        }

        const users = getUsers();
        const normalizedIdentifier = identifier.toLowerCase();

        const user = users.find(candidate =>
            candidate.username.toLowerCase() === normalizedIdentifier ||
            candidate.contact.toLowerCase() === normalizedIdentifier
        );

        if (!user || user.password !== password) {
            showMessage(
                loginMessage,
                'Los datos de acceso no son correctos.',
                'error'
            );
            return;
        }

        // Guardamos solamente la sesión de demostración.
        // La autenticación real se implementará posteriormente.
        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                id: user.id,
                username: user.username,
                name: user.name,
                zone: user.zone
            })
        );

        showMessage(
            loginMessage,
            `¡Bienvenido, ${user.name}!`,
            'success'
        );
    });


    // =========================================================
    // RECUPERACIÓN DE CONTRASEÑA
    // =========================================================

    document
        .getElementById('forgot-password')
        .addEventListener('click', () => {
            showMessage(
                loginMessage,
                'La recuperación de contraseña se habilitará cuando conectemos el sistema de autenticación.',
                'error'
            );
        });
})();
