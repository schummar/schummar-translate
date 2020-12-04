export default {
  // Common
  abort: "Abbrechen",
  close: "Schließen",
  continue: "Weiter",
  back: "Zurück",
  ok: "Ok",
  attention: "Achtung",
  deposit: "Pfand",
  single: "Einzeln",
  bottle: "Flasche",
  capacity: "{$}er",

  session: {
    deploymentRunning:
      "Update wird ausgeführt.\nBitte nehmen Sie einen anderen EASY Shopper.",
    lowBattery:
      "Der Akku ist fast leer.\nBitte nehmen Sie einen anderen EASY Shopper.",
    loading: "Laden...",
    maintenanceMode: "Außer Betrieb",
    startSession: "Reaktiviere mich",
    activate: "Jetzt einkaufen",
  },

  header: {
    find: "Produkt finden",
    pluFind: "EASY Shopper Nr.",
    logout: {
      title: "Wollen Sie den Einkauf beenden?",
      no: "Weiter einkaufen",
      yes: "Einkauf beenden",
    },
    customerCardPointsTooltip:
      "{$|0=Sammeln Sie DeutschlandCard-Punkte!|=Sie haben während dieses Einkaufs {$} DeutschlandCard-Punkt{$|1=|=e} gesammelt!}",
    customerCardPointsDisclaimer:
      "Die tatsächliche DeutschlandCard Punkteberechnung wird an der Kasse durchgeführt. Es kann daher unter Umständen zu Abweichungen kommen.",
  },

  info: {
    couponReceived: {
      title: "Liebe Kundin, lieber Kunde,",
      message:
        "Gutscheine und Coupons können aktuell ausschließlich an der Kasse eingelöst werden.",
    },
    smallChangeVoucherScanned: {
      title: "Bitte präsentieren Sie diesen Bon an der Kasse",
    },
    discountCode: {
      title: "Rabattcode {$}",
      message: "Scannen Sie jetzt den zu rabattierenden Artikel.",
    },
    initiateTransfer: {
      title: "Einkaufstransfer",
      message: "Bitte nun Kunden einloggen",
    },
    processingTransfer: {
      title: "Einkaufstransfer",
      message: "Einkauf wird geladen...",
    },
    customerCardScanned: {
      title: "DeutschlandCard gescannt",
      message:
        "Ihnen werden die DeutschlandCard-Punkte für diesen Einkauf automatisch gutgeschrieben",
    },
    employeeCardScanned: "Mitarbeiterkarte gescannt",
    weightProductSearch: {
      title: "Dieser Artikel muss gewogen werden",
      message: "Scannen Sie bitte das ausgedruckte Etikett",
    },
    cannotAddProductSearch: {
      title: "Dieser Artikel kann nicht über die Suche hinzugefügt werden",
      message: "Scannen Sie bitte den Barcode",
    },
    logoutDeclinedLegal: {
      title: "Einkauf abgebrochen",
      message:
        "Wenn Sie bereits Produkte im Wagen haben, legen Sie diese bitte zurück.",
    },
  },

  error: {
    common: "Es ist ein Fehler aufgetreten.",
    unknownProduct: {
      title: "Unbekannter Artikel: {$}",
      message:
        "Bitte rufen Sie einen Mitarbeiter oder lassen Sie dieses Produkt an der Kasse scannen.",
    },
    invalidBottleReturnReceipt: {
      title: "Pfandbon ist ungültig.",
      message: "Bitte an der Info melden. ",
    },
    session: {
      12001: {
        title: "Einkaufstransfer fehlgeschlagen",
        message: "Bitte versuchen Sie es erneut.",
      },
      107: {
        title: "Dieser Artikel ist von der Rabattierung ausgeschlossen",
        message: "Der Artikel wurde nicht hinzugefügt.",
      },
      109: {
        title: "Pfandbon bereits gescannt.",
        message: "Sie haben diesen Pfandbon bereits gescannt.",
      },
      122: {
        title: "Dieser Artikel kann nicht noch einmal eingescannt werden.",
        message: "Dieser Artikel kann nur einmal gescannt werden.",
      },
      123: {
        title: "Dieser Wagen ist zurzeit außer Betrieb",
        message: "Bitte nutzen Sie einen anderen Wagen.",
      },
    },
    code: "Code {$} konnte nicht gerendert werden",
  },

  sos: {
    title: "Benötigen Sie die Hilfe eines Mitarbeiters?",
    secondTitle: "Häufig gestellte Fragen",
    helpIsComing: "Ein Mitarbeiter ist unterwegs. ",
    priceDifference: {
      label: "Besteht eine Preisdifferenz?",
      answer:
        "EASY Shopper nutzt die Preise der Kasse. Manchmal kommt es vor, dass am Regal veraltete Preise angezeigt werden. Etwaige Rabatte werden erst an der Kasse abgezogen. ",
      ticket: "Preisdifferenz",
    },
    productNotFound: {
      label: "Produkt nicht gefunden?",
      answer: "Ein Mitarbeiter kommt und hilft Ihnen bei der Suche. ",
      ticket: "Produkt nicht gefunden",
    },
    operationUnclear: {
      label: "Bedienung EASY Shopper unklar?",
      answer: "Ein Mitarbeiter kommt und wird Sie unterstützen. ",
      ticket: "Bedienung unklar",
    },
    productAdvice: {
      label: "Produktberatung gewünscht?",
      answer: "Ein Mitarbeiter kommt und wird Sie beraten. ",
      ticket: "Produktberatung",
    },
    scannerProblems: {
      label: "Problem mit dem Scanner?",
      answer:
        "Ein Mitarbeiter wurde informiert. Sie können den Barcode gerne auch als Nummer in der Suche eingeben. ",
      ticket: "Scannerproblem",
    },
    anotherReason: {
      label: "Anderer Grund",
      answer: "Ein Mitarbeiter kommt und wird Sie beraten. ",
      ticket: "Anderer Grund",
    },
    cashierRequest: {
      label: "Wartezeit an der Kasse zu lange?",
      answer:
        "Wir werden versuchen eine zusätzliche Kasse zu öffnen. Bitte haben Sie einen Moment Geduld.",
      ticket: "Weitere Kasse anfordern",
      cancel: "Kassenanfrage stornieren",
    },
    instructions: {
      priceDifference: {
        label: "Preisdifferenz",
        question:
          "Der Preis des eingescannten Produktes stimmt nicht mit dem Preisschild am Regal überein?",
        steps: "2",
        stepsText:
          "1+Klicken Sie einmal auf den Warenkorb oben rechts im Display: Hier werden eventuelle Rabatte abgezogen und der endgültige Preis errechnet.*Stimmt der Preis im Warenkorb nicht, rufen Sie einen Mitarbeiter zu sich – dieser unterstützt Sie gerne bei der Ermittlung des korrekten Preises.",
      },
      privacy: {
        label: "Datensicherheit",
        question: "Was passiert eigentlich mit meinen Daten?",
        steps: "2",
        stepsText:
          "1+Es erfolgt lediglich eine technische Datenerhebung zum Zweck der Zahlungsabwicklung bzw. bei der DeutschlandCard zur Übertragung der Karte und den damit verbundenen Bonusprogrammen.*Es erfolgt keine Weitergabe der Daten außerhalb des für den Kassenvorgang nötigen Prozesses.",
      },
      bbdCoupon: {
        label: "Rabattaufkleber",
        question:
          "Wie bekomme ich rabattierte Produkte in meinen Einkaufswagen? ",
        steps: "2",
        stepsText:
          "1+Scannen Sie zuerst den Barcode des Rabattaufklebers und direkt danach den Barcode des rabattierten Produktes.*Das Produkt kann nicht rabattiert werden? Rufen Sie einen Mitarbeiter zu sich, der Sie gerne unterstützt.",
      },
      payment: {
        label: "Zahlen mit der App",
        question: "Wie funktioniert das Zahlen mit der App?",
        steps: "4",
        stepsText:
          '1+Hinterlegen Sie Ihre Visa oder MasterCard unter Mein Profil in der App.*Sobald Sie sich im Kassenbereich befinden, drücken Sie auf "Bezahlung starten" und dann auf "Mit der App bezahlen". Nun öffnet sich ein Fenster in Ihrer App, welches Sie bestätigen müssen.*Der Einkauf schließt sich automatisch. Sobald die Lampe an Ihrem Easy Shopper grün leuchtet, können Sie mit Ihrem Einkauf den Markt verlassen.*Sie möchten einen Bon? Kein Problem. Lassen Sie sich direkt an der EASY Shopper Kasse oder an der Information Ihren Bon ausdrucken. Zusätzlich ist Ihr Bon immer digital in Ihrer App hinterlegt. Sie finden ihn unter Meine Einkäufe.',
      },
    },
    askAnEmployeeForHelp: "Jetzt einen Mitarbeiter rufen",
    abortNotice:
      'Falls Sie doch keine Hilfe mehr benötigen, drücken Sie bitte auf "Doch keine Hilfe".',
    aborted: "Hilferuf abgebrochen. Sie können gerne weiter einkaufen.",
    cancel: "Doch keine Hilfe",
    map:
      "Helfen Sie unseren Mitarbeitern, Sie zu finden. Wo befinden Sie sich?",
  },

  search: {
    pluPlaceholder: "Tippen Sie hier",
    error: "Bei Ihrer Suchanfrage ist ein Fehler aufgetreten.",
    reload: "Erneut versuchen",
    placeholder: "Suchbegriff oder Barcode",
    flags: "Kein Barcode",
    extra: "Zusätzliche Filter",
    isAction: "Aktionsprodukte",
    isNear: "In der Nähe",
    priceFilter: "Preisfilter",
    pricesTop: "Häufigste",
    pricesAsc: "Aufsteigend",
    navigate: "Navigieren",
    addToList: "Einkaufsliste",
    ok: "{$} Produkt{$|0=e|2-=e} zum Warenkorb hinzufügen",
    pluOk: "Zum Warenkorb hinzufügen",
    more: "Weitere Treffer anzeigen",
    whatIf: "{$} Produkt{$|0=e|2-=e} ohne Filter",
    addPriceFilter: "Nach Preis filtern",
    noResults: "Es wurde kein passendes Produkt gefunden.",
  },

  details: {
    change: "Ändern",
    navigation: "Navigieren",
    addedForRecipe:
      'Dieses Produkt haben Sie für das Rezept "{sourceRecipeName}" auf die Liste gesetzt.',
    delete: "Löschen",
  },

  amountConfig: {
    selected: "Ausgewählt",
    pending:
      "Artikeldaten werden geladen. Sie können Ihren Einkauf einfach fortsetzen.",
    sum: "Summe {$}",
    cannotDecrease: "Leider kann dieser Artikel nicht zurückgegeben werden.",
    cannotIncrease:
      "Für diesen Artikel muss jedes Stück einzeln gescannt werden.",
    haveScanned: "Sie haben {$} gescannt",
    pleaseSelect: "Bitte wählen Sie eine Packungsgröße aus:",
    bundlesTitle: "Oder haben Sie:",
    emptyCrate: {
      button: "Leere Kiste hinzufügen",
      title: "Wollen Sie eine leere Kiste hinzufügen?",
      name: {
        1: "Halbe Kiste",
        2: "Ganze Kiste",
      },
    },
    keepDeposit:
      "Bitte heben Sie den Pfandbon auf und geben Sie ihn an der Kasse ab.",
  },

  payment: {
    title: "Zahlung wird durchgeführt",
    loading: "Bezahlung wird vorbereitet...",
    abort: "Zahlung abbrechen",
    methods: {
      cashier: "An der Kasse bezahlen",
      creditcard: "Mit der App bezahlen",
    },
    preview: {
      total: "Summe",
      diff: "Kassendifferenz",
      rebate: "Rabatt",
      pending: "Warte auf Kasse",
      start: "Bezahlung starten",
      empty: "Ihr Warenkorb ist leer.",
      navigate: "Navigieren",
    },
    summary: {
      title: "Zusammenfassung",
      pending: "Warte auf Kasse",
      outside:
        "Sie sind außerhalb des Kassenbereichs. Bitte nähern Sie sich der Kasse, um die Bezahlung starten zu können.",
    },
    verification: {
      title: "Zu erledigen",
      subTitle: "Bitte wenden Sie sich an die EASY Shopper Kasse.",
      ageCheck: "Altersprüfung {$} Jahre",
      deposit: "Pfandbon abgeben",
      collectItem: "Abholware nicht vergessen: {$}",
      stickerAlbum: "Sammelstickeralben: {$}",
      checkAgeRestrictionMagazine: "Jugendschutz: Zeitschrift(en) prüfen! ",
      collectLoyaltyCard: "Treue-Punkte Sammelheft einsammeln",
      printPinForPhoneCardOrVoucher:
        "Pin Ausdruck! Telefonkarte/Geschenkgutschein!",
    },
    inProgress: {
      title: "Bezahlung",
      header: "Bitte warten Sie, bis Ihre Bezahlung bestätigt wurde.",
    },
    inApp: {
      header:
        "Öffnen Sie die App auf Ihrem Handy, um die Zahlung zu bestätigen.",
    },
    done: {
      title: "Fertig",
      header: "Danke für Ihren Einkauf. Einkauf wird beendet.",
      subHeader: "Nicht vergessen:",
    },
    reminders: {
      general:
        "Ihr Kassenbon und ggf. Gutscheine liegen jetzt für Sie an der EASY Kasse / Info bereit. Bitte sprechen Sie unser Personal an.",
    },
    fallback: {
      qr: "Zeige QR Codes",
      ean: "Zeige Rückstellbon",
      end: "Zahlung abschließen",
    },
    userDenied: {
      title: "Sie haben die Zahlung in der App abgelehnt",
      message: "Bitte wählen Sie erneut eine Zahlungsmethode",
    },
    invalidPaymentMethod: {
      title: "Zahlungsart nicht möglich",
      message:
        "Es gab ein Problem mit der Kasse. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsart.",
    },
    invalidPaymentMethodRequiresPos: {
      title: "Zahlungsart nicht möglich",
      message:
        "Es befinden sich Artikel in Ihrem Warenkorb, die diese Zahlungsart nicht zulässt. Bitte zahlen Sie an der EASY Shopper Kasse.",
    },
    unresolvedItems:
      "Einige Artikel konnten noch nicht aufgelöst werden. Die endgültige Summe wird an der Kasse ermittelt und kann höher ausfallen.",
    Einkauf: "Einkauf: ",
    Rabatt: "Rabatt: ",
    Leergut: "Leergut: ",
    Kassendifferenz: "Kassendifferenz",
  },

  priceEnter: {
    title: "Produkt über Warengruppe hinzufügen",
    groupTitle: "1. Warengruppe wählen:",
    searchPlaceholder: "Suche",
    priceTitle: "2. Preis eingeben:",
    pricePlaceholder: "Preis",
  },

  navigation: {
    waiting: "Warte auf Navigationsdaten...",
    noTarget:
      "Es tut uns leid, für dieses Produkt liegen uns keine Regalplatzinformationen vor.",
    targetCheckout: "Die Kasse ist ",
    targetProduct: "Das Produkt ist",
    away: "entfernt",
    targetReached: "Ziel erreicht!",
    checkoutNear: "Die Kasse befindet sich in Ihrer näheren Umgebung.",
    productNear: "Das Produkt befindet sich in Ihrer näheren Umgebung.",
    groupNear: "Das Produkt befindet sich in Ihrer weiteren Umgebung.",
    back: "Zurück zur Übersicht",
    notFound: {
      button: "Produkt nicht gefunden?",
      title: "Danke für Ihre Hilfe!",
      report: "Produkt nur melden",
      sos: "Hilfe: Produkt nicht gefunden",
    },
    title: "Sie suchen:",
    warningMultiple:
      "Diesen Artikel können Sie an mehreren Stellen im Markt finden",
  },

  devices: {
    ledAndNavigation: "LED und Navigation neustarten",
    disableWifi: "Wifi deaktivieren",
    enableWifi: "Wifi aktivieren",
    restartWifi: "Wifi neustarten",
    showDisplayTest: "Display testen",
    displayTestSuccessful: "Test erfolgreich!",
    showScanner: "Barcode Scanner",
    restartCart: "Cart neustarten",
    shutdownCart: "Cart runterfahren",
    restartCartmessage:
      "Sind Sie sicher, dass Sie den Cart neustarten möchten?",
    shutdownCartmessage:
      "Sind Sie sicher, dass Sie den Cart herunterfahren möchten?",
  },

  legal: {
    title: {
      terms_and_conditions: "Nutzungsbedingungen",
      data_privacy: "Datenschutzerklärung",
      notify_customer_dont_steal: "Liebe Kundin, lieber Kunde,",
    },
    message: {
      notify_customer_dont_steal:
        "bitte stellen Sie sicher, dass alle Produkte im Warenkorb gescannt oder über das Display hinzugefügt wurden. Wir wünschen Ihnen einen schönen Einkauf.",
    },
    denyFirst: "Ablehnen",
    denySecond: "Wirklich ablehnen",
    denyAreYouSure:
      "Sind Sie sicher, dass Sie ablehnen möchten? Ohne Ihre Zustimmung kann der EASY Shopper leider nicht genutzt werden. Wir bitten um Ihr Verständnis.",
    reset: "Zurück zum Text",
    accept: "Hiermit akzeptiere ich die",
    verifyBasket: {
      title: "Liebe Kundin, lieber Kunde,",
      message:
        "wir weisen Sie darauf hin, dass Sie verpflichtet sind alle Produkte im Warenkorb zu scannen oder über das Display hinzuzufügen bevor die Zahlung eingeleitet wird.",
      back: "Noch einmal überprüfen",
    },
  },

  voucherPromotion: {
    title: "Donnerstag ist {store} Tag!",
    reached: "Geschafft: {$} Gutschein",
    next: "Ihr nächstes Ziel: {$} Gutschein",
    disclaimer:
      "Die tatsächliche Gutscheinberechnung wird an der Kasse durchgeführt. Es kann daher unter Umständen zu Abweichungen kommen. ",
    thursdayPromo:
      "Ab einem Einkauf von {threshold} erhalten Sie einen {value} Gutschein.",
  },

  discountPromotion: {
    title: "Kleb dir deinen Rabatt",
    message1:
      "Klicken Sie auf einen der verfügbaren Rabatte, wenn Sie ihn auf dieses Produkt anwenden möchten. ",
    message2:
      "Sie können jeden verfügbaren Rabatt nur auf einen einzelnen Artikel anwenden. ",
  },

  customerMessage: {
    LOYALTY_ITEM_SHOW_COLLECT_CARD:
      "Der angezeigte Preis ist nur gültig mit vollem Sammelheft. Denken Sie daran, an der Kasse Ihr Sammelheft vorzuzeigen.",
    ITEMS_NEEDS_TO_BE_COLLECTED:
      "Denken Sie daran, den Artikel nach Bezahlung an der Info abzuholen.",
    PHONE_OR_GIFT_CARD_ACTIVATED_AT_CASHIER:
      "Den Aktivierungspin für Ihre Telefon- oder Gutscheinkarte erhalten Sie an der Kasse auf dem ausgedruckten Bon.",
    GIFTBASKET_SHOW_INFO_POINT:
      "Bitte lassen Sie dieses Produkt an der Kasse einscannen.",
    CUSTOMER_CARD_INVALID_MOBILE_APP: [
      "Ihre DeutschlandCardnummer ist ungültig. Sie können Ihre DeutschlandCard am EASY Shopper erneut scannen um sie für diesen Einkauf zu verwenden.",
      "Um diese Warnung nicht wieder zu sehen, scannen Sie Ihre DeutschlandCard bitte auch in der App erneut ein.",
    ],
    EMPLOYEE_CARD_INVALID_MOBILE_APP: [
      "Ihre Mitarbeiterkartennummer ist ungültig. Sie können Ihre Mitarbeiterkarte am EASY Shopper erneut scannen um sie für diesen Einkauf zu verwenden.",
      "Um diese Warnung nicht wieder zu sehen, scannen Sie Ihre Mitarbeiterkarte bitte auch in der App erneut ein.",
    ],
  },

  sessionReopen: {
    reopen: "Einkauf wiederherstellen",
    success: "Einkauf wiederhergestellt",
    time: "Vor {$}",
    items: "{$} Artikel",
    totalAmount: "{$}",
  },

  settings: {
    header: "Einstellungen",
    lock: {
      label: "Kindersicherung",
      explanation:
        "Erlaubt es, den Bildschirm zu sperren und so Eingabe duch Kinder zu verhindern",
    },
  },

  lock: {
    info:
      "Um die Bildschirmsperre aufzuheben, ziehen Sie den Knopf von links nach rechts.",
  },

  hiddenMenu: {
    title: "Mitarbeiter Optionen",

    reloadPage: "Seite neu laden",
    hwoSession: "HWO Session",
    endSession: "Einkauf beenden",
    reopenSession: "Einkauf wiederherstellen",
    endSessionConfirm: "Einkauf wirklich beenden?",

    paymentFallback: "Zahlungs-Fallback",
    demo: "Demo-Modus",
    testMode: "Debug Details",
    devTools: "DevTools",

    enterPrice: "Manuelle Preiseingabe",
    map: "Karte",
    services: "Status Dienste",
    sensors: "Status Sensoren",
    hardware: "Hardware",
    features: "Funktionen",

    servicesTitle: "Service Status:",
    sensorsTitle: "Sensor Status:",
    languageCustomers: "Für Kunden",
    languageEmployees: "Für Mitarbeiter",
    preserveLanguage: "Nach Logout merken",
    navigation: "Navigation",
    maintenanceMode: "Wartung",
    barcodeInput: "Barcode eingeben",
    sosDuringPayment: "SOS während der Zahlung",
    sosMapEnabled: "SOS-Karte",
    noStoreMap: "Es gibt keine hochgeladene Markt Karte für diesen Markt",
    noStoreMapTitle: "Keine hochgeladene Markt Karte",
    navigationExperimentalZoom: "Navigation Zoom",
    navigationExperimentalZoomThreshold: "Navigation Zoom wenn nah",
  },

  basket: {
    keepDeposit: "Bitte heben Sie den Pfandbon auf",
    label: "Warenkorb",
  },

  shopping: {
    label: "Einkaufsliste",
  },

  recipe: {
    loading: "Rezepte werden geladen",
    empty: [
      "Für diese Auswahl haben wir leider keine Rezepte gefunden.",
      "Bitte entfernen Sie Filter.",
    ],
    difficulties: {
      title: "Maximale Schwierigkeit",
      0: "Einfach",
      1: "Mittel",
      2: "Schwer",
    },
    times: {
      title: "Maximaler Zeitaufwand",
      subtitle: "Minuten",
      10: "10",
      30: "30",
      60: "60",
      all: "mehr",
    },
    labels: {
      title: "Kategorien",
      more: "+ {$} weitere",
      add: "+ Kategorie hinzufügen",
      selectTitle: "Kategorien hinzufügen",
      selectSearchPlaceholder: "Tippen Sie um Kategorien zu filtern",
    },
    ingredients: "Zutaten",
    instructions: "Zubereitung",
    servings: "Portionen",
    selectAll: "Alle auswählen",
    deselectAll: "Alle abwählen",
    confirm: "{$} Zutat{$|0=en|2-=en} auf die Einkaufsliste",
    recipeRef: "Rezept:",
    addInfo: [
      "Scannen Sie den QR Code mit Ihrem Handy, um das Rezept im Browser zu öffnen.",
      "In Kürze können Sie Ihre hinzugefügten Rezepte auch in der App wiederfinden.",
    ],
    loadError: "Beim Laden der Rezepte ist ein Fehler aufgetreten",
    tryAgain: "Erneut versuchen",
  },

  advertisement: {
    moreInfo: "Mehr Informationen",
  },

  recommendation: {
    title: "Andere Kunden kauften auch",
  },

  login: {
    conjunction: "oder",
    0: {
      title: "Anmeldung",
      step1:
        "Sie können entweder die EASY Shopper App auf Ihrem Handy oder Ihre DeutschlandCard verwenden, um sich am EASY Shopper anzumelden. Halten Sie dazu den Code unter “Anmeldung” oder den Barcode auf der Rückseite Ihrer DeutschlandCard unter den Scanner. ",
      step2: " ",
      step3: " ",
    },
    1: {
      title: "Hinzufügen eines Produktes",
      step1: "Scannen Sie den aufgedruckten Barcode auf dem Produkt. ",
      step2: "Fügen Sie das Produkt über die Produktsuche hinzu. ",
      step3: " ",
    },
    2: {
      title: "EASY Bezahlung",
      step1:
        "Leiten Sie die Bezahlung selbständig ein und genießen Sie den Vorteil nicht mehr an der Kasse zu warten. Alles bleibt im Wagen. Easy.",
      step2: " ",
      step3: " ",
    },
  },
} as const;
