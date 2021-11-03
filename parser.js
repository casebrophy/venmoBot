
/**
 * Interface to allow for managment of the web api from a different script.
 * Should be able to return a list of email's waiting to be processed, and a way to pick and remove one for further parsing
 * Or have an event that on addition to the list notifies the next script, so that the the text can be processed
 * Or maybe a method to check if the list is empty, and if not be able to pull the next element in the list
 *
 * @type {{}}
 */

require('dotenv').config();
//listening for mail
const { EventEmitter, errorMonitor} = require("events");
const mailEmitter = new EventEmitter();


let MailListener = require("mail-listener2");
let currentTime = new Date().getTime();


let mailListener = new MailListener( {
    username: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    connTimeout: 10000,
    authTimeout: 5000,
    tlsOptions: {rejectUnauthorized: false},
    mailbox: "VENMO",
    searchFilter: ["UNSEEN", ["SINCE", currentTime + 1000]],
    markSeen: true,
    mailParserOptions: {streamAttachments: true},
    fetchUnreadOnStart: false,
    attachments: false,
});

mailListener.start();

//start listening

mailListener.on("server:connected", function () {
    console.log('connected');
});

mailListener.on("server:disconnected", function () {
    console.log("disconnected");
});

mailListener.on("error", function (err) {
    console.log("error!", err);
});

mailListener.on("mail", function (mail, seqno, attributes) {

    mailEmitter.emit("newPayment", mail.subject);

    console.log(mail.subject);

});



const Queue = require('queue');
let mailQ = Queue({autostart:true, results: []})

mailQ.on('success', function (result, job) {
    console.log(job)
    console.log('The result is:', result)
    if (result === 0) {
        console.log("Sorry you paid the wrong amount")
    }
    else {
        jobQueue.push(function (cb) {
            setTimeout( function ()   {
                cb(null,"Have a great day " + result.userName);
            }, 2000)

        })
    }

})


mailEmitter.on('newPayment', (data) => {
    console.log(data.toString() + ". Parsing...");
    mailQ.push(function (cb) {
        let result = checkText(data);
        cb(null, result);
    })
})


//emits to dispenser
function checkText (mail) {

    console.log(mail.toString())
    //split the mail string into an array
    let mailCheck = mail.split(' ');

    //return true if the message has these keywords
    //For testing this is commented out
    //if (mailCheck[2] !== "Paid") {
    if (1 !== 1){
        //return false
        return (0)
    }
    //else if (mailCheck[4] === "$5"){
    else if (1 !== 1) {
        //return false
        return (0)
    }
    console.log(mailCheck[2], mailCheck[4])
    return {userName: mailCheck[0]};
}

//dispenser
/**
 * This script is to dispense the cups, will work eventually.
 * Just using it to set up an even in dispenser
 */

let jobQueue = new Queue({autostart: true, results: []});

//async func to dispense cup - will probably have to talk to server in some way.
jobQueue.on("success", function (result, job) {
    console.log("Cup dispensed successfully")
    console.log(result)
})
