import { TIMEOUT_SEC } from './config.js'

const timeout = function (s) {
    return new Promise(function (_resolve, reject) {
        setTimeout(function () {
            reject(
                new Error(`Request took too long! Timeout after ${s} second`)
            )
        }, s * 1000)
    })
}

export const AJAX = async function ({ auth0Client, url, method, uploadData }) {
    const headers = {}
    let body

    if (auth0Client) {
        const token = await auth0Client.getTokenSilently()
        headers.Authorization = `Bearer ${token}`
    }

    if (uploadData) {
        headers['Content-Type'] = 'application/json'
        body = JSON.stringify(uploadData)
    }

    const fetchPro = fetch(url, {
        method,
        headers,
        ...{ body },
    })

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)])
    const data = await res.json()

    if (!res.ok) throw new Error(`${data.message} (${res.status})`)
    return data
}
