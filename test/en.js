export default {
  // Common
  abort: 'Cancel',
  close: 'Close',
  continue: 'Continue',
  back: 'Back',
  ok: 'Ok',
  attention: 'Attention',

  deposit: 'Deposit',
  single: 'Single',
  bottle: 'Bottle',
  capacity: '{$}er',

  session: {
    deploymentRunning: 'Update in progress.\nPlease use a different EASY Shopper.',
    lowBattery: 'Battery is low.\nPlease use a different EASY Shopper. ',
    loading: 'Loading...',
    maintenanceMode: 'Out of Service',
    startSession: 'Start shopping',
    activate: 'Shop now',
  },

  header: {
    pluFind: 'EASY Shopper No.',
    find: 'Product Search',
    logout: {
      title: 'Would you like to end your shopping session?',
      no: 'Continue Shopping',
      yes: 'End Session',
    },
    customerCardPointsTooltip:
      '{$|0=Collect DeutschlandCard points!|=You have collected {$} DeutschlandCard point{$|1=|=s} during this purchase!}',
  },

  info: {
    couponReceived: {
      title: 'Dear customer,',
      message: 'Vouchers and coupons can only be validated at the cash register.',
    },
    smallChangeVoucherScanned: {
      title: 'Please submit this voucher at the checkout. ',
    },
    discountCode: {
      title: 'Discount code {$}',
      message: 'Now scan your item to be discounted.',
    },
    initiateTransfer: {
      title: 'Session transfer',
      message: "Please scan customer's login code",
    },
    processingTransfer: {
      title: 'Session transfer',
      message: 'Session loading...',
    },
    customerCardScanned: {
      title: 'DeutschlandCard scanned',
      message: 'You will automatically be credited the DeutschlandCard points for this purchase',
    },
    employeeCardScanned: 'Employee card scanned',
    weightProductSearch: {
      title: 'This item needs to be weighed',
      message: 'Please scan the printed label',
    },
    cannotAddProductSearch: {
      title: 'This item cannot be added via search',
      message: "Please scan the item's barcode",
    },
    logoutDeclinedLegal: {
      title: 'Shopping session canceled',
      message: 'If you have items in your basket, please return them.',
    },
  },

  error: {
    common: 'An error occurred.',
    unknownProduct: {
      title: 'Unknown item: {$}',
      message: 'Please call for an employee or have this item scanned at the checkout.',
    },
    invalidBottleReturnReceipt: {
      title: 'This bottle return receipt is invalid.',
      message: 'Please refer to the information desk.',
    },
    session: {
      12001: { title: 'Session transfer failed', message: 'Please try again.' },
      107: {
        title: 'This item is excluded from discounts.',
        message: 'The item was not added.',
      },
      109: {
        title: 'Deposit coupon has already been scanned.',
        message: 'Bottle return receipt is already scanned. ',
      },
      122: {
        title: 'This article cannot be scanned again.',
        message: 'This article can be scanned only once.',
      },
      123: {
        title: 'This cart is currently out of service',
        message: 'Please use a different cart.',
      },
    },
    code: 'Code {$} could not be rendered',
  },

  sos: {
    title: 'You have selected help. How may we assist you?',
    secondTitle: 'Do you have a question about these topics?',
    helpIsComing: 'An employee is on their way to assist you. ',
    priceDifference: {
      label: 'Is there a price difference?',
      answer:
        'EASY Shopper uses the same prices as the checkout system. It may occur, that a label on the shelf shows an outdated price. Potential discounts are deducted once at checkout. ',
      ticket: 'Price difference',
    },
    productNotFound: {
      label: 'Item not found?',
      answer: 'An employee will be with you to assist with your search in a moment. ',
      ticket: 'Item not found',
    },
    operationUnclear: {
      label: 'Operation of EASY Shopper unclear?',
      answer: 'An employee is on their way to assist you. ',
      ticket: 'Operation unclear',
    },
    productAdvice: {
      label: 'Item consulting wanted?',
      answer: 'An employee is on their way to assist you. ',
      ticket: 'Item consulting',
    },
    scannerProblems: {
      label: 'Problem with scanner?',
      answer: 'Staff has been notified. You may also enter the barcode number into the item search. ',
      ticket: 'Scanner problem',
    },
    anotherReason: {
      label: 'Other reason',
      answer: 'An employee is on their way to assist you. ',
      ticket: 'Other reason',
    },
    cashierRequest: {
      label: 'Waiting too long at checkout?',
      answer: 'One moment please, we will try to open another checkout lane.',
      ticket: 'Ask for additional checkout',
      cancel: 'Cancel additional checkout request',
    },
    abortNotice: `If you don't need any more assistance, please press "Cancel Help".`,
    askAnEmployeeForHelp: 'Ask an employee for help',
    aborted: 'Help canceled. Please continue with your shopping experience.',
    cancel: 'Cancel Help',
    map: 'Please help our staff to find you more easily. Where are you located?',

    instructions: {
      priceDifference: {
        label: 'Price difference',
        question: 'The price of the scanned product does not match the price tag on the shelf?',
        steps: 2,
        stepsText:
          '1+Click once on the shopping cart at the top right of the display: Any discounts will be deducted and the final price will be calculated.*If the price in the shopping cart is not correct, call for an employee, they will be happy to assist you in determining the correct price.',
      },
      privacy: {
        label: 'Data security',
        question: 'What actually happens to my data?',
        steps: 2,
        stepsText:
          '1+There is only a technical data collection for the purpose of payment processing or with the DeutschlandCard for the transfer of the card and the associated bonus programs.*The data is not passed on outside of the necessary checkout process. ',
      },
      bbdCoupon: {
        label: 'Discount stickers',
        question: 'How do I get discounted products into my shopping cart? ',
        steps: 2,
        stepsText:
          '1+First, scan the barcode of the discount label, followed by the barcode of the discounted product.*Item can not be discounted? Call an employee who will be happy to assist you. ',
      },
      payment: {
        label: 'Pay with your app',
        question: 'How do I pay with my app?',
        steps: 4,
        stepsText:
          '1+Store your Visa or MasterCard under My Profile in the app.*Once you are in the checkout area, press "Start payment" and then click "Pay with the app". A window will open in your app, which you have to confirm.*The purchase closes automatically. As soon as the lamp on your Easy Shopper lights up green, you can leave the store with your purchase.*You would like a receipt? No problem. Have your receipt printed out directly at the EASY Shopper checkout or at the information desk. In addition, your receipt is always stored digitally in your app. You can find it under My purchases. ',
      },
    },
  },

  search: {
    pluPlaceholder: 'Enter search here',
    error: 'An error occurred while processing your search request.',
    reload: 'Try again',
    placeholder: 'Search item or barcode',
    flags: 'No Barcode',
    extra: 'Additional Filters',
    isAction: 'Items on Sale',
    isNear: 'Near You',
    priceFilter: 'Price Filter',
    pricesTop: 'Most Frequent',
    pricesAsc: 'Lowest to Highest',
    navigate: 'Navigate',
    addToList: 'Shopping List',
    ok: 'Add {$} item{$|0=s|2-=s} to cart',
    pluOk: 'Add item to cart',
    more: 'Show more matches',
    whatIf: '{$} Item{$|0=s|2-=s} without filters',
    addPriceFilter: 'Filter by price',
    noResults: 'No matching products found.',
  },

  details: {
    change: 'Change',
    navigation: 'Navigate',
    addedForRecipe: 'You have added this product to the list for the recipe "{sourceRecipeName}".',
    delete: 'Remove',
  },

  amountConfig: {
    selected: 'Selected',
    pending: 'Items loading. Please continue with your shopping experience.',
    sum: 'Sum {$}',
    cannotDecrease: "We're sorry. This item cannot be returned.",
    cannotIncrease: 'For this item every piece has to be scanned separately.',
    haveScanned: 'You have scanned {$} ',
    pleaseSelect: 'Please select a size:',
    bundlesTitle: 'Or do you have:',
    emptyCrate: {
      button: 'Add Empty Case',
      title: 'Would you like to add an empty case?',
      name: {
        1: 'Half case',
        2: 'Whole case',
      },
    },
    keepDeposit: 'Please keep the bottle return receipt and submit it at the checkout.',
  },

  payment: {
    title: 'Payment in progress',
    loading: 'Preparing payment...',
    abort: 'Cancel Payment',
    methods: {
      cashier: 'Pay at Register',
      creditcard: 'Pay by App',
    },
    preview: {
      total: 'Total',
      diff: 'Price difference at register',
      rebate: 'Discount',
      pending: 'Pending',
      start: 'Start Payment Process',
      empty: 'Your cart is empty.',
      navigate: 'Navigate',
    },
    summary: {
      title: 'Summary',
      pending: 'Pending',
      outside: 'You are outside of the checkout area. Please move closer to the checkout in order to start the payment process.',
    },
    verification: {
      title: 'To do',
      subTitle: 'Please contact an available EASY Shopper cashier.',
      ageCheck: 'Age verification {$} years',
      deposit: 'Please turn in your bottle return receipt',
      collectItem: "Don't forget to collect your items: {$}",
      stickerAlbum: 'Sticker albums: {$}',
      checkAgeRestrictionMagazine: 'Age-restricted content: Please check magazine(s)!',
      collectLoyaltyCard: 'Collect loyalty points',
      printPinForPhoneCardOrVoucher: 'Collect printed pin for phone card/gift voucher',
    },
    inProgress: {
      title: 'Payment',
      header: 'Please wait until your payment is confirmed.',
    },
    inApp: { header: 'Open the app on your device to confirm payment.' },
    done: {
      title: 'Done',
      header: 'Thank you for shopping with us. Closing session.',
      subHeader: "Don't forget:",
    },
    reminders: {
      general:
        'Your receipt and coupons, if applicable, are ready for pickup at the EASY checkout / service desk. Please contact our staff.',
    },
    fallback: {
      qr: 'Show QR Codes',
      ean: 'Show Reset Receipt',
      end: 'Finish Payment',
    },
    userDenied: {
      title: 'You have declined your payment by app',
      message: 'Please choose your payment method',
    },
    invalidPaymentMethod: {
      title: 'Chosen payment option not available',
      message: 'An error has occured. Please try again or choose a different payment option.',
    },
    invalidPaymentMethodRequiresPos: {
      title: 'Invalid Payment Method',
      message: 'There are items in your cart that do not allow for this payment method. Please pay at the EASY Shopper checkout.',
    },
    unresolvedItems:
      'There are unresolved items in your cart. Your final total will be determined at checkout at could potentially be higher.',
    Einkauf: 'Purchase: ',
    Rabatt: 'Discount: ',
    Leergut: 'Bottle deposit: ',
    Kassendifferenz: 'Cash difference',
  },

  priceEnter: {
    title: 'Add Item Via Commodity Group',
    groupTitle: '1. Choose commodity group:',
    searchPlaceholder: 'Search',
    priceTitle: '2. Enter price:',
    pricePlaceholder: 'Price',
  },

  navigation: {
    waiting: 'Waiting for navigation data...',
    noTarget: 'We are sorry, there is no navigation data for this item.',
    targetCheckout: 'The checkout is ',
    targetProduct: 'Your target is',
    away: 'away',
    targetReached: 'You have reached your target!',
    checkoutNear: 'The checkout is within close proximity.',
    productNear: 'The item is within close proximity.',
    groupNear: 'The item is within further proximity.',
    back: 'Return to Overview',
    notFound: {
      button: 'Item Not Found?',
      title: 'Thank You For Your Help!',
      report: 'Report Item',
      sos: 'Help: Item Not Found',
    },
  },

  devices: {
    ledAndNavigation: 'Restart LED and Navigation',
    disableWifi: 'Disable WiFi',
    enableWifi: 'Activate WiFi',
    restartWifi: 'Restart WiFi',
    restartCart: 'Restart Cart',
    shutdownCart: 'Shutdown Cart',
    restartCartmessage: 'Are you sure you want to restart the Cart?',
    shutdownCartmessage: 'Are you sure you want to shutdown the Cart?',
    showDisplayTest: 'Test Display',
    displayTestSuccessful: 'Test successful!',
    showScanner: 'Barcode Scanner',
  },

  legal: {
    title: {
      terms_and_conditions: 'Terms of Use',
      data_privacy: 'Data Privacy Statement',
      notify_customer_dont_steal: 'Dear customer,',
    },
    message: {
      notify_customer_dont_steal:
        'Please ensure that all items in your cart have been scanned or added via search. Enjoy your shopping experience.',
    },
    denyFirst: 'Decline',
    denySecond: 'Yes, decline',
    denyAreYouSure:
      'Are you sure that you would like to decline? Unfortunately, without your permission, the EASY Shopper cannot be used. We apologize.',
    reset: 'Return to Text',
    accept: 'I hereby accept the',
    verifyBasket: {
      title: 'Dear customer,',
      message:
        'Allow us to point out to you, that you are obligated to either scan all items in your cart or add them via search before starting the payment process.',
      back: 'Verify',
    },
  },

  voucherPromotion: {
    title: 'Thursday is {store} Day! ',
    reached: 'Congrats: {$} Voucher',
    next: 'Your Next Goal: {$} Voucher',
    disclaimer: 'The actual voucher calculation will be processed at the cashier. Deviations are possible. ',
    thursdayPromo: 'From a purchase of {threshold} you will receive a {value} voucher. ',
  },

  discountPromotion: {
    title: 'Stick your discount',
    message1: 'Click on one of the available discounts if you want to apply it to this product.',
    message2: 'You can only apply each available discount to a single item.',
  },

  customerMessage: {
    LOYALTY_ITEM_SHOW_COLLECT_CARD:
      'The displayed price is only valid with a point-collection booklet in combination with the required points. Please ensure to present your point-collection booklet at the checkout.',
    ITEMS_NEEDS_TO_BE_COLLECTED: 'Remember to pick up the item after payment at the information desk. ',
    PHONE_OR_GIFT_CARD_ACTIVATED_AT_CASHIER:
      'You will receive the activation code for your mobile phone or gift card on a printed receipt at the checkout.',
    GIFTBASKET_SHOW_INFO_POINT: 'Please have an employee scan this item at the EASY Shopper register.',
    CUSTOMER_CARD_INVALID_MOBILE_APP: [
      'Your DeutschlandCard number is invalid. You can scan your DeutschlandCard at the EASY Shopper to activate it for this purchase.',
      'To not see this message again, please rescan your DeutschlandCard in the app as well.',
    ],
    EMPLOYEE_CARD_INVALID_MOBILE_APP: [
      'Your employee card number is invalid. You can scan your employee card at the EASY Shopper to activate it for this purchase.',
      'To not see this message again, please rescan your employee card in the app as well.',
    ],
  },

  sessionReopen: {
    reopen: 'Restore Purchase',
    success: 'Purchase Restored',
    time: '{$} ago',
    items: '{$} items',
    totalAmount: '{$}',
  },

  settings: {
    header: 'Settings',
    lock: {
      label: 'Child Safety Lock',
      explanation: 'Allows to lock the screen and thus prevent children from adding items',
    },
  },

  lock: {
    info: 'Slide button to the right to unlock display.',
  },

  hiddenMenu: {
    title: 'Employee Options',
    reloadPage: 'Reload Page',
    hwoSession: 'HWO Session',
    endSession: 'End shopping',
    reopenSession: 'Restore shopping',
    endSessionConfirm: 'Do you really want to finish shopping?',
    paymentFallback: 'Payment Fallback',
    demo: 'Demo mode',
    testMode: 'Debug Details',
    devTools: 'DevTools',
    enterPrice: 'Manual price entry',
    map: 'Map',
    services: 'Status services',
    sensors: 'Status sensors',
    hardware: 'Hardware',
    features: 'Features',
    servicesTitle: 'Service Status:',
    sensorsTitle: 'Sensor Status:',
    languageCustomers: 'For customers',
    languageEmployees: 'For employees',
    preserveLanguage: 'Remember me after logout',
    navigation: 'Navigation',
    maintenanceMode: 'Maintenance Mode',
    barcodeInput: 'Enter barcode',
    sosDuringPayment: 'SOS During Payment',
    sosMapEnabled: 'SOS Map',
    noStoreMap: 'There is no uploaded store map for this store',
    noStoreMapTitle: 'No uploaded store map',
  },

  basket: {
    keepDeposit: 'Please keep the bottle return receipt',
    label: 'Shopping Basket',
  },

  shopping: {
    label: 'Shopping List',
  },

  recipe: {
    loading: 'Loading Recipes',
    empty: ['Für diese Auswahl haben wir leider keine Rezepte gefunden.', 'Bitte entfernen Sie Filter.'],
    difficulties: {
      title: 'Max. difficulty level',
      0: 'Easy',
      1: 'Medium',
      2: 'Hard',
    },
    times: {
      title: 'Max. time and labor',
      subtitle: 'minutes',
      10: '10',
      30: '30',
      60: '60',
      all: 'more',
    },
    labels: {
      title: 'Categories',
      more: '+ {$} more',
      add: '+ add category',
      selectTitle: 'Add category',
      selectSearchPlaceholder: 'Type to filter categories',
    },
    ingredients: 'Ingredients',
    instructions: 'Instructions',
    servings: 'Servings',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    confirm: 'Add {$} Ingredient{$|0=s|2-=s} to shopping list',
    recipeRef: 'Recipe:',
    addInfo: [
      'Use your phone to scan the QR-code and open the recipe in your browser.',
      'Coming soon: Your selection of recipes available in your Easy Shopper App.',
    ],
    loadError: 'An error occurred while loading recipes',
    tryAgain: 'Try Again',
  },

  advertisement: {
    moreInfo: 'More information',
  },

  recommendation: {
    title: 'Other customers also bought',
  },

  login: {
    conjunction: 'or',
    0: {
      title: 'Log in',
      step1:
        'You can either use the EASY Shopper app on your mobile phone or your DeutschlandCard to log in to the EASY Shopper. Hold the code under "Login" or the barcode on the back of your DeutschlandCard under the scanner. ',
      step2: ' ',
      step3: ' ',
    },
    1: {
      title: 'Add a product',
      step1: 'Scan the barcode printed on the product.',
      step2: '    Add the product by selecting it from the search results.',
      step3: ' ',
    },
    2: {
      title: 'Pay',
      step1:
        'Start the payment process by tapping the cart icon on the screen. Enjoy the comfort of not waiting in line and not unpacking/repacking. Easy!',
      step2: ' ',
      step3: ' ',
    },
  },
};
