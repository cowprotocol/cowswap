interface TelegramData {
  auth_date: number
  first_name: string
  hash: string
  id: number
  photo_url: string
  username: string
}

const AUTH_GET_URL = 'https://oauth.telegram.org/auth/get'

/**
 * Reverse engineered from https://telegram.org/js/widget-frame.js?63
 */
export function getTelegramAuth(botId: number, callback: (data: { user: TelegramData } | false) => void): void {
  const xhr = new XMLHttpRequest()

  xhr.open('POST', AUTH_GET_URL + '?bot_id=' + botId)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.responseText) {
        try {
          callback(JSON.parse(xhr.responseText))
        } catch {
          callback(false)
        }
      } else {
        callback(false)
      }
    }
  }
  xhr.onerror = function () {
    callback(false)
  }
  xhr.withCredentials = true
  xhr.send()
}
