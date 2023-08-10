import { createAuth0Client } from '@auth0/auth0-spa-js'
import * as model from './model.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'
import authView from './views/authView'

import 'core-js/stable'
import 'regenerator-runtime/runtime'

import '../sass/main.scss'

let auth0Client = null

const controlAuthentication = async () => {
    auth0Client = await createAuth0Client({
        domain: 'dev-5hwndgvebevysof6.eu.auth0.com',
        clientId: 'Ks6wUNCpcoNJzejw9JC5yNupXMK183Qm',
        authorizationParams: {
            audience: 'https://forkify-fvelk.ondigitalocean.app/api/v1',
        },
        /**
         * Fixes: User is not logged in after page refresh
         * https://github.com/auth0/auth0-react/blob/master/FAQ.md#1-user-is-not-logged-in-after-page-refresh
         */
        useRefreshTokens: true,
        cacheLocation: 'localstorage',
    })

    const query = window.location.search
    if (query.includes('code=') && query.includes('state=')) {
        // Process the login state
        await auth0Client.handleRedirectCallback()

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, '/')
    }

    const isAuthenticated = await auth0Client.isAuthenticated()

    if (isAuthenticated) model.state.user = await auth0Client.getUser()

    Object.keys(model.state.user).length
        ? authView.renderLogout()
        : authView.renderLogin()
}

const controlRecipes = async function () {
    try {
        const id = window.location.hash.slice(1)

        if (!id) return
        recipeView.renderSpinner()

        resultsView.update(model.getSearchResultsPage())

        bookmarksView.update(model.state.bookmarks)

        await model.loadRecipe(id)

        recipeView.render(model.state.recipe)
    } catch (err) {
        recipeView.renderError()
        console.error(err)
    }
}

const controlSearchResults = async function () {
    try {
        resultsView.renderSpinner()

        const query = searchView.getQuery()
        if (!query) return

        await model.loadSearchResults(query)

        resultsView.render(model.getSearchResultsPage())

        paginationView.render(model.state.search)
    } catch (err) {
        console.log(err)
    }
}

const controlPagination = function (goToPage) {
    resultsView.render(model.getSearchResultsPage(goToPage))

    paginationView.render(model.state.search)
}

const controlServings = function (newServings) {
    model.updateServings(newServings)

    recipeView.update(model.state.recipe)
}

const controlAddBookmark = function () {
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
    else model.deleteBookmark(model.state.recipe.id)

    recipeView.update(model.state.recipe)

    bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
    try {
        addRecipeView.renderSpinner()

        await model.uploadRecipe(auth0Client, newRecipe)

        recipeView.render(model.state.recipe)

        addRecipeView.renderMessage()

        bookmarksView.render(model.state.bookmarks)

        window.history.pushState(null, '', `#${model.state.recipe.id}`)
    } catch (err) {
        console.error('💥', err)
        addRecipeView.renderError(err.message)
    }
}

const controllLogin = async () => {
    await auth0Client.loginWithRedirect({
        authorizationParams: {
            redirect_uri: window.location.origin,
        },
    })
}

const controllLogout = () => {
    auth0Client.logout({
        logoutParams: {
            returnTo: window.location.origin,
        },
    })
}

const controlDeleteRecipe = async () => {
    const id = window.location.hash.slice(1)

    if (!id) throw Error('Can not delete recipe. Recipe id is missing')

    recipeView.renderSpinner()

    await model.deleteRecipe(auth0Client, id)

    window.history.replaceState(null, '', location.origin)

    model.state.search.results = model.state.search.results.filter(
        (recipe) => recipe.id !== id
    )

    if (model.state.search.results.length) {
        resultsView.render(model.getSearchResultsPage())
    } else {
        recipeView.renderMessage('')
    }

    recipeView.renderMessage(
        'Recipe is deleted. </br> Search for a recipe or an ingredient.'
    )
}

const init = async () => {
    bookmarksView.addHandlerRender(controlBookmarks)
    recipeView.addHandlerRender(controlRecipes)
    recipeView.addHandlerUpdateServings(controlServings)
    recipeView.addHandlerAddBookmark(controlAddBookmark)
    recipeView.addHandlerDeleteRecipe(controlDeleteRecipe)
    searchView.addHandlerSearch(controlSearchResults)
    paginationView.addHandlerClick(controlPagination)
    addRecipeView.addHandlerUpload(controlAddRecipe)
    authView.addHandlerRender(controlAuthentication)
    authView.addHandlerLogin(controllLogin)
    authView.addHandlerLogout(controllLogout)
}

init()
