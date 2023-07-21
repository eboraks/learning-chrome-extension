chrome.action.onClicked.addListener((tab) => {
  console.log(
    'background.js got message. Action Clicked {tab.id: ' + tab.id + '}'
  )
  // This will open a tab-specific side panel only on the current tab.
  chrome.sidePanel.open({ tabId: tab.id })
  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: 'sidepanel/sidepanel.html',
    enabled: true,
  })
})

/* // Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === 'side_panel_loaded') {
    //  To do something
    console.log(request.data.subject)
    console.log(request.data.content)
  }
})
