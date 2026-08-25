(() => {
    'use strict';

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

    function showAuthPanel(name) {
        tabs.forEach(tab => {
            const active = tab.dataset.authTab === name;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', String(active));
        });
        Object.entries(panels).forEach(([key, panel]) => {
            const active = key === name;
            panel.hidden = !active;
            panel.classList.toggle('is-active', active);
        });
        clearMessages();
    }

    tabs.forEach(tab => tab.addEventListener('click', () => showAuthPanel(tab.dataset.authTab)));

    document.querySelectorAll('[data-toggle-password]').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.togglePassword);
            if (!input) return;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            button.textContent = show ? '🙈' : '👁';
        });
    });

    function passwordScore(value) {
        return Number(value.length >= 8) + Number(/[A-Z]/.test(value)) + Number(/[0-9]/.test(value)) + Number(/[^A-Za-z0-9]/.test(value));
    }

    function updatePasswordStrength(value) {
        const score = passwordScore(value);
        passwordStrength.className = 'password-strength';
        if (score) passwordStrength.classList.add(`level-${score}`);
        passwordStrengthText.textContent = [
            'Usa al menos 8 caracteres.',
            'Contraseña débil.',
            'Contraseña aceptable.',
            'Contraseña fuerte.',
            'Contraseña muy fuerte.'
        ][score];
    }

    document.getElementById('register-password').addEventListener('input', event => updatePasswordStrength(event.target.value));

    function setFieldError(id, message) {
        const field = document.getElementById(id);
        const error = document.querySelector(`[data-error-for="${id}"]`);
        if (field) field.classList.toggle('is-invalid', Boolean(message));
        if (error) error.textContent = message;
    }

    function clearFieldErrors(form) {
        form.querySelectorAll('.is-invalid').forEach(field => field.classList.remove('is-invalid'));
        form.querySelectorAll('.field-error').forEach(error => error.textContent = '');
    }

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

    function isEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    // ---------------------------------------------------------
    // REGISTRO CON SUPABASE AUTH
    // ---------------------------------------------------------

    registerForm.addEventListener('submit', async event => {
        event.preventDefault();
        clearFieldErrors(registerForm);

        const name = document.getElementById('register-name').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-contact').value.trim().toLowerCase();
        const password = document.getElementById('register-password').value;
        const zone = document.getElementById('register-zone').value;
        const terms = document.getElementById('register-terms').checked;

        let valid = true;

        if (name.length < 2) {
            setFieldError('register-name', 'Escribe tu nombre.');
            valid = false;
        }
        if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(username)) {
            setFieldError('register-username', 'Usa entre 3 y 20 caracteres: letras, números, punto, guion o guion bajo.');
            valid = false;
        }
        if (!isEmail(email)) {
            setFieldError('register-contact', 'Introduce un correo electrónico válido.');
            valid = false;
        }
        if (password.length < 8) {
            setFieldError('register-password', 'La contraseña debe tener al menos 8 caracteres.');
            valid = false;
        }
        if (!zone) {
            setFieldError('register-zone', 'Selecciona tu zona climática.');
            valid = false;
        }
        if (!terms) {
            setFieldError('register-terms', 'Debes aceptar los términos para continuar.');
            valid = false;
        }

        if (!valid) {
            showMessage(registerMessage, 'Revisa los campos marcados antes de continuar.', 'error');
            return;
        }

        try {
            const { data, error } = await agropediaSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nombre: name,
                        nombre_usuario: username,
                        zona_climatica: zone
                    }
                }
            });

            if (error) throw error;

            registerForm.reset();
            updatePasswordStrength('');

            if (data.session) {
                showMessage(registerMessage, 'Cuenta creada correctamente. Has iniciado sesión.', 'success');
            } else {
                showMessage(registerMessage, 'Cuenta creada correctamente. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.', 'success');
            }

            setTimeout(() => {
                showAuthPanel('login');
                document.getElementById('login-identifier').value = email;
            }, 1200);
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            showMessage(registerMessage, error.message || 'No fue posible crear la cuenta.', 'error');
        }
    });

    // ---------------------------------------------------------
    // LOGIN CON SUPABASE AUTH
    // ---------------------------------------------------------

    loginForm.addEventListener('submit', async event => {
        event.preventDefault();
        clearFieldErrors(loginForm);

        const email = document.getElementById('login-identifier').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        if (!isEmail(email)) {
            setFieldError('login-identifier', 'Por ahora utiliza el correo electrónico para iniciar sesión.');
            showMessage(loginMessage, 'Introduce un correo electrónico válido.', 'error');
            return;
        }
        if (!password) {
            setFieldError('login-password', 'Introduce tu contraseña.');
            showMessage(loginMessage, 'Completa los campos para iniciar sesión.', 'error');
            return;
        }

        try {
            const { error } = await agropediaSupabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showMessage(loginMessage, '¡Bienvenido a Agropedia!', 'success');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            showMessage(loginMessage, error.message || 'Los datos de acceso no son correctos.', 'error');
        }
    });

    // ---------------------------------------------------------
    // RECUPERACIÓN DE CONTRASEÑA
    // ---------------------------------------------------------

    document.getElementById('forgot-password').addEventListener('click', async () => {
        const email = document.getElementById('login-identifier').value.trim().toLowerCase();

        if (!isEmail(email)) {
            showMessage(loginMessage, 'Escribe primero tu correo electrónico.', 'error');
            return;
        }

        try {
            const { error } = await agropediaSupabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/registro.html`
            });
            if (error) throw error;
            showMessage(loginMessage, 'Si el correo está registrado, recibirás las instrucciones para recuperar tu contraseña.', 'success');
        } catch (error) {
            console.error('Error al recuperar contraseña:', error);
            showMessage(loginMessage, 'No fue posible solicitar la recuperación de contraseña.', 'error');
        }
    });
})();
