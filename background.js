let ravenBlocking = false
let omegaBlocking = false
let apiBlocking = false

const APIS = [
  'contract/reserveTemplate',
  'agreement/agreementAgree',
  'contract/template',
  'v4/credit/uploadIdentity',
  'v4/credit/uploadIdentity',
  'repay/repaymentSendSmscode',
  'v4/credit/sendSMS',
  'user/sms',
  'pay/contractAuth',
  'pay/stdContractAuth',
  'loan/sendLoanSms',
  'v4/credit/checkFaceResult',
  'repay/repaymentCashierSubmit',
  'repay/repaymentRirectSubmit',
  'repay/repaymentPartialSubmit',
  'loan/withdrawApply',
  'v4/credit/submitCredit',
  '/distribute/empty',
  'user/channelUnionDispatch',
  '/credit/submit-two-factor',
  '/credit/submit-credit',
  '/loan/apply',
  '/repayment/create-repay'
]

chrome.storage.sync.set({ MFE_API: APIS }, function () {
  console.log('API 设置成功')
})

chrome.storage.onChanged.addListener(function (changes) {
  for (key in changes) {
    var storageChange = changes[key];
    if (key === 'ravenBlocking') {
      ravenBlocking = storageChange.newValue
    }
    if (key === 'omegaBlocking') {
      omegaBlocking = storageChange.newValue
    }
    if (key === 'apiBlocking') {
      apiBlocking = storageChange.newValue
    }
  }
})

async function getStorage(type) {
  return new Promise((res) => {
    const storage = chrome.storage.sync
    storage.get(type, (data) => {
      res(data)
    })
  })
}

function checkIncludes(url, APIS) {
  let includes = false
  APIS.forEach(item => {
    if (url.includes(item)) {
      includes = true
    }
  })
  return includes
}

function handlerRequest(details) {
  if (
    (checkIncludes(details.url, ['raven.xiaojukeji.com']) && ravenBlocking) ||
    (checkIncludes(details.url, ['omgup']) && omegaBlocking)
  ) {
    return {
      cancel: true,
    }
  }
  if (
    checkIncludes(details.url, APIS) && apiBlocking
  ) {
    const api = details.url.split("?")[0];
    const res = window.prompt(`
访问此接口很危险？请确认！

${api.slice(api.indexOf("/api"))}

输入 Y/N
  `);
    if (res.toLowerCase() === "y") {
      return {
        cancel: false,
      };
    } else {
      return {
        cancel: true,
      };
    }
  }
}

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  if (tab.url && tab.status === 'complete') {
    const dataR = await getStorage('ravenBlocking')
    ravenBlocking = dataR.ravenBlocking

    const dataO = await getStorage('omegaBlocking')
    omegaBlocking = dataO.omegaBlocking
  }

  if (chrome.webRequest.onBeforeRequest.hasListener(handlerRequest)) {
    return
  }
  chrome.webRequest.onBeforeRequest.addListener(
    handlerRequest,
    {
      urls: [
        "*://manhattan.webapp.xiaojukeji.com/hebe/*",
        "*://manhattan.webapp.xiaojukeji.com/zeus/*",
        "*://manhattan.webapp.xiaojukeji.com/hera/*",
        "*://raven.xiaojukeji.com/*",
        "*://omgup.xiaojukeji.com/*",
        "*://omgup1.xiaojukeji.com/*",
        "*://omgup2.xiaojukeji.com/*",
        "*://omgup3.xiaojukeji.com/*",
      ],
    },
    ["blocking", "requestBody", "extraHeaders"]
  )
})

chrome.runtime.onInstalled.addListener(function(){
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({pageUrl: {urlContains: 'manhattan.webapp.xiaojukeji.com'}})
				],
				actions: [new chrome.declarativeContent.ShowPageAction()]
			}
		])
	})
})
