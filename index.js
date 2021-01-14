
var currentUserKey = '';
//var chatMessage = '';
var chatKey = '';

function startedChat(friendkey, friendName, friendPhoto) {
    var friendList = {friendId: friendkey, userId: currentUserKey};
     var db = firebase.database().ref('friend_List');
     var flag = false;
     db.on('value', function (friends){
         friends.forEach(function(data){
             var user = data.val();
             if((user.friendId === friendList.friendId && user.userId === friendList.userId) || ((user.friendId === friendList.userId && user.userId === friendList.friendId))){
                flag = true;
                chatKey = data.key;
             }


        });
        if (flag === false) {

            chatKey = firebase.database().ref('friend_List').push(friendList, function(error) {
                if (error) alert(error);
                else {
                    
                    document.getElementById('chatPannel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style' , 'display:none');
        
                    hideChatList();
        
                }
        
            }).getKey();

        }
        else {
            document.getElementById('chatPannel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style' , 'display:none');
        
            hideChatList();

        }
    // ////////////////////
    // display friend name and photo
    document.getElementById('divChatName').innerHTML = friendName;
    document.getElementById('imageChat').src = friendPhoto;

    document.getElementById('messages').innerHTML = '';

    onKeyDown();
        document.getElementById('txtMessage').value = '';
        document.getElementById('txtMessage').focus();



    //////////////Display privious saved messages from Database////
    loadChatMessages(chatKey);

     });
     
}
//////////////////////////////////
function loadChatMessages(chatKey) {
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value' , function(chats) {
        var  messageDisplay = '';
        chats.forEach(function(data) {
         
          var  chat = data.val();
          var dateTime = chat.dateTime.split(",");
          
          
          
          if (chat.userId !== currentUserKey) {
              messageDisplay += `<div class="row">
                                    <div class="col-2 col-sm-1 col-md-1">
                                    <img class="chat-pic rounded-circle" src="images/pp.png" alt="image">
                                    </div>
                                    <div class="col-6 col-sm-6 col-md-6">
                                        <p class="receive">${chat.msg}
                                        <span class="time float-right" title='${dateTime[0]}'>${dateTime[1]}</span>
                                        </p>
                                    </div>
                                </div>`;


                                           
         }
          else {
            messageDisplay += `<div class="row justify-content-end">
                        
            <div class="col-6 col-sm-7 col-md-7 ">
            <p class="sent float-right" >${chat.msg}
                <span class="time float-right" title='${dateTime[0]}'>${dateTime[1]}</span>
            </p>
            </div>
            <div class="col-2 col-sm-1 col-md-1">
            <img src="${firebase.auth().currentUser.photoURL}" class="chat-pic rounded-circle">
            </div>

            </div>`;

          }
             
                


        });
        document.getElementById('messages').innerHTML = messageDisplay ;
        document.getElementById('messages').scrollTo(0 , document.getElementById('messages').clientHeight);
        
    });
}

function showChatList(){

    document.getElementById('side-1').classList.remove('d-none' , 'd-md-block');

    document.getElementById('side-2').classList.add('d-noe');
}
function hideChatList(){

    document.getElementById('side-1').classList.add('d-none' , 'd-md-block');

    document.getElementById('side-2').classList.remove('d-noe');
}

function onKeyDown() {
    document.addEventListener('keydown' , function(key){
        if (key.which === 13) {
            sendMessage();

        }
    });

}



function sendMessage() {
var chatMessage = {
    userId:currentUserKey,
    msg:document.getElementById('txtMessage').value,
    dateTime: new Date().toLocaleString()
};
firebase.database().ref('chatMessages').child(chatKey).push(chatMessage , function(error) {
    if (error) alert(error);
    else {
//         var message = `<div class="row justify-content-end">
                        
//     <div class="col-6 col-sm-7 col-md-7 ">
//         <p class="sent float-right">${document.getElementById('txtMessage').value}
//             <span class="time float-right">1.26PM</span>
//         </p>
//     </div>
//     <div class="col-2 col-sm-1 col-md-1">
//         <img src="${firebase.auth().currentUser.photoURL}" class="chat-pic rounded-circle">
//     </div>

// </div>`;
//document.getElementById('messages').innerHTML += message ;
document.getElementById('txtMessage').value = '';
document.getElementById('txtMessage').focus();

//document.getElementById('messages').scrollTo(0 , document.getElementById('messages').clientHeight);

    }
});
   
    //console.log(document.getElementById('txtMessage').value);
    
}
///////////////////////////////////////////////

function loadChatList() {
    var db = firebase.database().ref('friend_List');
    db.on('value' , function(lists) {
        document.getElementById('lstChat').innerHTML = `<li class="list-group-item" style="background-color: #f8f8f8;">
                                                        <input type="text" placeholder="search or new chat" class="form-control form-rounded">
                                                        </li>`;
       // console.log(lists);
         lists.forEach(function(data){
            var lst = data.val();
            //console.log(lst);
            
             var friendKey = '';
            if (lst.friendId === currentUserKey) {
                friendKey = lst.userId;
                
            }
            else if (lst.userId === currentUserKey) {
                        friendKey = lst.friendId;
                
            }
            
            
           if (friendKey !== '' && friendKey !== 1) {
                
                    firebase.database().ref('users').child(friendKey).on('value' , function(data) {
                            var user = data.val();
                            document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="startedChat('${data.key}' , '${user.name}' , '${user.photoURL}')">
                                                                                <div class="row">
                                                                            <div class="col-md-2">
                                                                                <img src="${user.photoURL}"  alt="image" class="friend-pic rounded-circle">
                                                                                </div>
                                                                                <div class="col-md-10" style="cursor: pointer;">
                                                                                <div class="name">${user.name}</div>
                                                                                <div class="under-name">This is some message text...</div>
                                                                                </div>
                                                                                </div>
                                                                            </li>`;

                    });
           }
        });

    });
}
function populateFriendList() {
    document.getElementById('lstFriend').innerHTML = `<div class="text-center">
                                                        <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
                                                    </div>`;

    var db = firebase.database().ref('users');
    var lst = '';
        
        db.on('value' , function(users) {

            if (users.hasChildren()) {
                 lst = `<li class="list-group-item" style="background-color: #f8f8f8;">
                            <input type="text" placeholder="search or new chat" class="form-control form-rounded">
                            </li>`;
            }
            
            
            users.forEach(function(data){
                var user = data.val();
                if (user.email !== firebase.auth().currentUser.email) {
                    lst += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="startedChat('${data.key}' , '${user.name}' , '${user.photoURL}')">
                <div class="row">
                    <div class="col-md-2">
                        <img src="${user.photoURL}" alt="image" class="rounded-circle friend-pic">
                    </div>
                    <div class="col-md-10" style="cursor: pointer;">
                        <div class="name">${user.name}</div>
                        
                    </div>
                    </div>
                </li>`;
                

                }
                


            });

            document.getElementById('lstFriend').innerHTML = lst;
            

            

        });
             

}





function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}

function signOut () {
    firebase.auth().signOut();
}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user) {
    if (user) {
        //alert(firebase.auth().currentUser.email + `\n` + firebase.auth().currentUser.displayName);
        
        var userProfile = {email:'', name:'' , photoURL:'' }

        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;
        
        var dbb = firebase.database().ref('users');
        var flag = false;
        dbb.on('value' , function(users) {
            users.forEach(function(data){
                var user = data.val();
                if(user.email === userProfile.email){
                    currentUserKey = data.key;
                flag = true;
                
                }


            });
            if (flag === false) {
                firebase.database().ref('users').push(userProfile , callback);

            }
            else {
                document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;


                document.getElementById('lnkSignIn').style = 'display:none'  ;
                document.getElementById('lnkSignOut').style = '' ;


            }

            document.getElementById('linkNewChat').classList.remove('disabled');

            loadChatList();

        });
         
        
        
    }
    else {
          
        document.getElementById('imgProfile').src = ' images/pp.png';
        document.getElementById('imgProfile').title = '' ;

        document.getElementById('lnkSignIn').style = ''  ;
        document.getElementById('lnkSignOut').style = 'display:none' ;

        document.getElementById('linkNewChat').classList.add('disabled');
    }
}

function callback(error) {
    if (error) {
        alert(error)
    }
    else {
        document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;


        document.getElementById('lnkSignIn').style = 'display:none'  ;
        document.getElementById('lnkSignOut').style = '' ;

    }
}

//Call auth stae //
 onFirebaseStateChanged();