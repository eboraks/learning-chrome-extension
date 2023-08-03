const Elements = {
  SP_DIV: 'sp_div',
  SP_P: 'sp_p',
  SP_BUTTON: 'sp_button',
  ICOG_DIV: 'icog_div',
}

const get_from_local_storage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (result[key]) {
        console.log('Found item in local storage', result[key])
        resolve(result[key])
      } else {
        reject(`Found nothing in local storage ${key}`)
      }
    })
  })
}

const render_document = async (icog_doc) => {
  const top_div = document.getElementById(Elements.ICOG_DIV)

  // Remove all children
  if (top_div.children.length > 0) {
    top_div.innerHTML = ''
  }

  // Render the document within div
  const textarea = document.createElement('textarea')
  const keyphrases_header = document.createElement('h2')
  keyphrases_header.textContent = 'Keyphrases'
  const summary_header = document.createElement('h2')
  summary_header.textContent = 'Summary'
  textarea.id = 'summary'
  textarea.rows = 20
  textarea.cols = 50
  textarea.textContent = icog_doc.summary_generated

  const list = document.createElement('ul')
  for (const keyphrase of icog_doc.keyphrases) {
    if (keyphrase.score > 0.7) {
      const listItem = document.createElement('li')
      listItem.textContent = `${keyphrase.word} (${keyphrase.score.toFixed(2)})`
      list.appendChild(listItem)
    }
  }
  top_div.appendChild(keyphrases_header)
  top_div.appendChild(list)
  top_div.appendChild(summary_header)
  top_div.appendChild(textarea)

  return top_div
}

const update_page_with_document = async (document_id) => {
  chrome.runtime
    .sendMessage({ msg: 'get-document', data: document_id })
    .then((response) => {
      console.log('Send get document, response', response.data)
      return response.data
    })
    .then((document) => {
      if (document) {
        console.log('update_page_with_document, document', document)
        render_document(document)
      } else {
        console.log('update_page_with_document, no document')
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

const update_page = async (url, bookmark) => {
  const element = document.getElementById('sp_p')
  element.textContent = `The current page is ${url}`

  if (!bookmark) {
    const cached_bookmark = await get_from_local_storage(btoa(url))
    if (cached_bookmark) {
      console.log('update_page, cached bookmark', cached_bookmark.document_id)
      update_page_with_document(cached_bookmark.document_id)
    } else {
      console.log('update_page, no cached bookmark')
    }
  } else {
    console.log('update_page, bookmark', bookmark)
    update_page_with_document(bookmark.document_id)
  }
}

// Let the background script know that side panel is loaded
chrome.runtime
  .sendMessage({
    msg: 'side-panel-loaded',
  })
  .then((response) => {
    console.log('Send side panel loaded, response', response.data)
    update_page(response.data)
  })

const action_button = () => {
  const button = document.getElementById('sp_button')
  button.textContent = 'Generate summary'
  button.addEventListener('click', () => {
    console.log('side panel action button clicked')
    chrome.runtime
      .sendMessage({
        msg: 'side-panel-button-clicked',
      })
      .then((response) => {
        console.log('response from background.js', response)
        return response.data
      })
      .then((data) => {
        console.log(data)
        update_page(data.url, data)
      })
      .catch((error) => {
        console.log(error)
      })
  })
}
action_button()
