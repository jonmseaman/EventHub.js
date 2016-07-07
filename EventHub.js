var eventHub = {
    namespace: "ServiceBusIntern2016",
    name: "sellersite",
    deviceName: "device-01",
    getUrl: function () {
        var url = 'https://' + this.namespace + '.servicebus.windows.net:443/'
            + this.name + '/publishers/' + this.deviceName + '/messages';
        return url;
    },
    sendData: function (str) {
        // Send a post
        var eh = new XMLHttpRequest();
        var eventHubUrl = eventHub.getUrl();
        eh.open("POST", eventHubUrl, true);
        eh.onloadend = function () {
            console.log("Status " + eh.status);
        }
        eh.setRequestHeader("Authorization", SAS.sas);
        eh.setRequestHeader("Content-Length", str.length);
        eh.setRequestHeader("Content-Type", "application/atom+xml;type=entry;charset=utf-8");
        eh.send(str);
    },
    sendObject: function (object) {
        eventHub.sendData(JSON.stringify(object));
    }

}

var SAS = {
    sas: null,
    serverUrl: "PUT SAS URL HERE",

    // Updates sas then runs the passed function on load end.
    updateThenOnLoadEnd: function (onLoadEndFunction) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onloadend = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                SAS.sas = xmlHttp.responseText;
            }
            if (onLoadEndFunction != null) {
                onLoadEndFunction();
            }
        }

        xmlHttp.open("GET", SAS.serverUrl, true); 
        // Don't cache to ensure new SAS.
        xmlHttp.setRequestHeader("Pragma", "no-cache");
        xmlHttp.send(null);
    },
    update: function () {
        SAS.updateThenOnLoadEnd(null);
    },
    get: function () {
        var sasRequest = new XMLHttpRequest();
        sasRequest.open("GET", SAS.serverUrl, false);
        // Make sure we get a new SAS key.
        sasRequest.setRequestHeader("Pragma", "no-cache");
        sasRequest.send(null);
        return sasRequest.responseText;
    }


}
SAS.update();

var pageData = {
    EntryTime: Date.now(),
}

function clickEvent(nextUrl) {
    var click = {
        CurrentUrl: window.location.href,
        NextUrl: nextUrl,
        EntryTime: pageData.EntryTime,
        ExitTime: Date.now(),

        // User
        Email: "jon@example.com",
        // Session Id
        SessionId: "1",
        EventType: 1,
    }

    return click;
}

function purchaseEvent() {
    var purchase = {
        ProductId: 1,
        Price: 250,
        Quantity: 1,
        Time: Date.now(),

        // User
        Email: "jon@example.com",
        // Session Id
        SessionId: "1",
        EventType: 2,
    }

    return purchase;
}

function sendClick(a) {
    var click = clickEvent(a.href);
    eventHub.sendObject(click);
    // Temporary:
    document.getElementById('clickEvent').innerHTML = JSON.stringify(click);
    return true;
}

function sendPurchase(purchaseForm) {
    console.log('Sending a purchase event.');
    var elems = purchaseForm;
    var p = purchaseEvent();

    p.Email = elems['Email'].value;
    p.ProductId = elems['ProductId'].value;
    p.Price = elems['Price'].value;
    p.Quantity = elems['Quantity'].value;
    p.Time = elems['Time'].value;

    console.log(JSON.stringify(p));

    // TODO: Set up session id.

    eventHub.sendObject(p);
    document.getElementById('purchaseEvent').innerHTML = JSON.stringify(p);
    return true;
}

window.onload = function () {
    // Set on click events from links.
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        links[i].setAttribute("onclick", "sendClick(this);");
    }

    // Set up on click events for purchases.
    var purchaseForm = document.getElementById("purchaseForm");
    purchaseForm.elements['purchase'].setAttribute('onclick', "sendPurchase(this.parentNode);");
}


