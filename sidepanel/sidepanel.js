// Write chrome extension code that listen for action clicks and get the current tab
console.log('Side Panel Loaded')

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

console.log('current tab id: ' + getCurrentTab().id)

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === 'something_completed') {
    //  To do something
    console.log(request.data.subject)
    console.log(request.data.content)
  }
})

chrome.runtime.sendMessage({
  msg: 'side_panel_loaded',
  data: {
    subject: 'Side Panel',
    content: 'The side panel loaded!',
  },
})
