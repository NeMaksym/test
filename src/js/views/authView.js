class AuthView {
    _btnLogin = document.querySelector('.nav__btn--login')
    _btnLogout = document.querySelector('.nav__btn--logout')

    addHandlerLogin(handler) {
        this._btnLogin.addEventListener('click', function (e) {
            e.preventDefault()
            handler()
        })
    }

    addHandlerLogout(handler) {
        this._btnLogout.addEventListener('click', function (e) {
            e.preventDefault()
            handler()
        })
    }

    renderLogin() {
        this._btnLogout.classList.add('hidden')
        this._btnLogin.classList.remove('hidden')
    }

    renderLogout() {
        this._btnLogin.classList.add('hidden')
        this._btnLogout.classList.remove('hidden')
    }

    addHandlerRender(handler) {
        window.addEventListener('load', handler)
    }
}

export default new AuthView()
