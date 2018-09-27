var database = firebase.database()
// Get a reference to the root of the Database
// A Reference represents a specific location in your Database and can be used for reading or writing data to that Database location.

// You can reference the root or child location in your Database by calling firebase.database().ref() or firebase.database().ref("child/path").

// Writing is done with the set() method and reading can be done with the on() method. See Read and Write Data on the Web
// var rootRef = firebase.database().ref();

$('#message-form').submit(function(event) {
  event.preventDefault()

  var message = $('#message').val()

  // create a section for messages data in your db
  var messagesReference = database.ref('messages')

  messagesReference.push({
    message: message,
    votes: 0,
    // add a `user` property to each message
    user: firebase.auth().currentUser.displayName,
  })

  $('#message').val('')
})

function getFanMessages() {
  database.ref('messages').on('value', function (results) {

    // remove existing <li>'s from DOM; avoid duplicates - there are MUCH cleaner methods to handle this, FYI :)
    $('.message-board').empty();

    results.forEach(function (msg) {
      var message = msg.val().message
      var votes = msg.val().votes
      var user = msg.val().user
      var id = msg.key
      var $li = $('<li>').text(message + ' - ' + user)

      // create up vote element
      var $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>');

      $upVoteElement.on('click', function () {
        updateMessage(id, ++votes);
      })

      // create down vote element
      var $downVoteElement = $('<i class="fa fa-thumbs-down pull-right"></i>');

      $downVoteElement.on('click', function () {
        updateMessage(id, --votes);
      })

      // create delete element
      var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');

      $deleteElement.on('click', function () {
        deleteMessage(id);
      })

      $li.append($deleteElement);

      // add voting elements to $li
      $li.append($downVoteElement);
      $li.append($upVoteElement);
      $li.append('<div class="pull-right">' + votes + '</div>');

      $('.message-board').append($li)
    })
  })
}

function updateMessage (id, votes) {
  // find message whose objectId is equal to the id we're searching with
  var messageReference = database.ref('messages/' + id);

  // update votes property
  messageReference.update({
    votes: votes
  })
}

function deleteMessage (id) {
  // find message whose objectId is equal to the id we're searching with
  var messageReference = database.ref('messages/' + id);

  messageReference.remove();
}

getFanMessages()

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth())

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function() {
      return false;
    },
  },
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
}

ui.start('#firebaseui-auth-container', uiConfig)

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    $('#sign-in-container').hide()
    $('#message-board-container').show()
  } else {
    $('#sign-in-container').show()
    $('#message-board-container').hide()
  }
})

$('#sign-out').click(function() {
  firebase.auth().signOut()
})
