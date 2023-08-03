const bookmarks = new Map()
const base_url = 'http://localhost:8889'

// 05A905
const Colors = {
  Blue: '#4688F1',
  Green: '#3CB371',
  Red: '#FF0000',
}
const Status = {
  Saved: 'Saved',
  InProcess: 'Working',
  Error: 'Error',
}
const Endpoints = {
  bookmark: '/bookmark',
  bookmarks: '/bookmarks',
  document: '/document/{ID}',
  keyphrase: '/document/{ID}/keyphrases',
}

//Open the side panel and display the document summary and keyphrases
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: 'sidepanel/sidepanel.html',
    enabled: true,
  })
  chrome.sidePanel.open({ tabId: tab.id })
  console.log(
    'background.js got message. Action Clicked {tab.url: ' + tab.url + '}'
  )
})

const update_bookmark_cache = async () => {
  console.log('Updating bookmark cache')
  fetch(`${base_url}${Endpoints.bookmarks}`)
    .then((response) => {
      return response.json()
    })
    .then((data) => {
      console.log(data)
      data.forEach((bookmark) => {
        const storage_obj = {}
        storage_obj[btoa(bookmark.url)] = bookmark
        chrome.storage.local.set(storage_obj)
      })
      console.log(`Bookmarks cache updated with ${data.size} bookmarks`)
    })
    .catch((error) => {
      console.log(`Error while updating bookmark cache ${error}`)
    })
}

const responseWithURL = async (sendResponse) => {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })
  const url = clean_url(tabs[0].url)
  console.log(`background.js side-panel-loaded, activated with url ${url}`)
  sendResponse({ success: true, data: url })
  update_bookmark_cache()
}

const fetch_document = async (document_id) => {
  console.log(`Caching document ${document_id}`)
  fetch(`${base_url}${Endpoints.document.replace('{ID}', document_id)}`)
    .then((response) => {
      console.log(response)
      return response.json()
    })
    .catch((error) => {
      console.log(`Error while caching document ${error}`)
    })
}

const responseWithDocument = async (request, sendResponse) => {
  console.log('background.js get-document, request', request.data)
  fetch(`${base_url}${Endpoints.document.replace('{ID}', request.data)}`)
    .then((response) => {
      console.log(response)
      return response.json()
    })
    .then((document) => {
      console.log(`Fetch document ${document.id} sendResponse`)
      sendResponse({ success: true, data: document })
    })
    .catch((error) => {
      console.log(`Error while caching document ${error}`)
    })

  /* const storage_obj = {}
  storage_obj[document_id] = data
  return chrome.storage.local.set(storage_obj) */
}

const handleActionButtonClick = async (request, sendResponse) => {
  console.log('background.js side-panel-button-clicked, request', request)
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })
  const url = clean_url(tabs[0].url)
  fetch(`${base_url}${Endpoints.bookmark}`, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
    }),
  })
    .then((response) => {
      return response.json()
    })
    .then((bookmark) => {
      console.log('HandleActionButtonClick - Bookmark success', bookmark)
      sendResponse({ success: true, data: bookmark })
    })
    .catch((error) => {
      console.log('HandleActionButtonClick - Bookmark error', error)
      sendResponse({ success: true, data: 'Error creating/getting bookmark' })
    })
}

const handleOnMessageRequest = (request, sender, sendResponse) => {
  if (request.msg === 'side-panel-loaded') {
    responseWithURL(sendResponse)
    return true
  }

  if (request.msg === 'get-document') {
    responseWithDocument(request, sendResponse)
    return true
  }

  if (request.msg === 'side-panel-button-clicked') {
    handleActionButtonClick(request, sendResponse)
    return true
  }
}

chrome.runtime.onMessage.addListener(handleOnMessageRequest)

function clean_url(url) {
  const url_cleaner_regex = /(http.*:\/\/[a-zA-Z0-9:\/\.\-]*)/g
  matches = url.matchAll(url_cleaner_regex)
  clean = Array.from(matches, (m) => m[1])[0]
  //page_url = encodeURIComponent(page_url)
  return clean
}
