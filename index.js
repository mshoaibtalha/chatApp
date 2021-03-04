
var currentUserKey = ''; //Global variable.
var chatKey = '';

// sending message
document.addEventListener('keydown', function(event){
    if(event.key === "Enter"){
        sendMessage(); 
        //console.log('Enter');  
    }
});
///////////////
function changeSendIcon(control){
    if(control.value !== ''){
        document.getElementById('send').removeAttribute('style');
        document.getElementById('audio').setAttribute('style','display:none');
    }
    else{
        document.getElementById('audio').removeAttribute('style');
        document.getElementById('send').setAttribute('style' , 'display:none');
    }
}
////////////////////
//Audio record

     let chunks = [];
     let recorder;
     var timeout;
function record(control){
    let device = navigator.mediaDevices.getUserMedia({audio: true});
    device.then(stream =>{
        if(recorder === undefined){
            recorder = new MediaRecorder(stream);
        recorder.ondataavailable = e =>{
            chunks.push(e.data);

            if(recorder.state === 'inactive'){
                let blob = new Blob(chunks, {type: 'audio/webm'});
              // document.getElementById('audio').innerHTML ='<source src="'+ URL.createObjectURL(blob) +'" type="audio/webm">';
              var reader = new FileReader();
              reader.addEventListener('load', function(){
                  var chatMessage = {
                      userId: currentUserKey,
                      msg: reader.result,
                      msgType:'audio',
                      dateTime: new Date().toLocaleString()
                  };
                  firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error){
                      if(error) {alert(error);
                      }
                      else{
             
                   document.getElementById('txtMessage').value = '';
                   document.getElementById('txtMessage').focus();
                      }
                  });
              }, false);
      
                  reader.readAsDataURL(blob);
              
               }
        }
        recorder.start();
        control.setAttribute('class','fas fa-stop fa-2x');
    }
        
    });
    if(recorder !== undefined){
        if(control.getAttribute('class').indexOf('stop')!== -1){
            recorder.stop();
            control.setAttribute('class', 'fas fa-microphone fa-2x');
        }
        else{
            chunks = [];
            recorder.start();
            control.setAttribute('class','fas fa-stop fa-2x');
        }
    }
    
}
/////////////////////////////////////////////
// emoji function
loadAllEmoji();
function loadAllEmoji(){
    var emoji = '';
    for(var i = 128512; i <= 128566; i++){
        emoji += `<a href="#" style = "font-size:25px" onclick="getEmoji(this)">&#${i};</a>`;
    }
    document.getElementById('smiley').innerHTML = emoji;
}

function showEmojiPanel(){
    document.getElementById('emoji').removeAttribute("style");
}
function hideEmojiPanel(){
    document.getElementById('emoji').setAttribute("style", "display:none;");
}
function getEmoji(control){
   document.getElementById('txtMessage').value += control.innerHTML; 
}

/////////////////////
function startChat(friendKey, friendName, friendPhoto){
    var friendList = {friendId: friendKey, userId: currentUserKey};


    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value', function(friends){
        friends.forEach(function(data){
            var user = data.val();
            if((user.friendId === friendList.friendId && user.userId === friendList.userId) || (user.friendId === friendList.userId && user.userId === friendList.friendId)){
                flag = true;
                chatKey = data.key;
            }
        });
        if(flag === false){
            chatKey =   firebase.database().ref('friend_list').push(friendList, function(error){
                if(error) alert(error);
                else{
                    document.getElementById('chatPannel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style','display:none');
                    hideChatList();
                    // to get focus on input field when clicking on friends icon.
                    document.getElementById('txtMessage').focus();
                }
            }).getKey();
        }
        else{
            document.getElementById('chatPannel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style','display:none');
            hideChatList();
            // to get focus on input field when clicking on friends icon.
            document.getElementById('txtMessage').focus();
        }
        //------------- displaying friend's name and image.------------
        document.getElementById('divChatName').innerHTML = friendName;
        document.getElementById('imgChat').src = friendPhoto;
        document.getElementById('divChatSeen').innerHTML = new Date().toLocaleString();

        document.getElementById('messages').innerHTML = '';

       // onKeyDown();
        document.getElementById('txtMessage').focus();
        document.getElementById('txtMessage').value = '';
    //--------- Display chat messages

        loadChatMessages(chatKey,friendPhoto);

    });
}
function loadChatMessages(chatKey, friendPhoto){
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function(chats){
        var messageDisplay = '';
        chats.forEach(function(data){
        var chat = data.val();
        var dateTime = chat.dateTime.split(',');
        var msg = '';
        if(chat.msgType === 'image'){
            msg = `<img src="${chat.msg}" class = "img-fluid">`;
        }
        else if(chat.msgType === 'audio'){
            msg = `<audio id="audio" controls>
            <source src="${chat.msg}" type="audio/webm">
            </audio>`;
        }  
        else{
            msg = chat.msg;
        }  
        if(chat.userId !== currentUserKey){
        messageDisplay += ` <div class="row">
                            <div class="col-2 col-sm-1 col-md-1">
                                <img class="chat-pic rounded-circle" src="${friendPhoto}" alt="image">
                            </div>
                            <div class="col-6 col-sm-6 col-md-6">
                                <p class="receive"> ${msg}
                                <span class="time" title="${dateTime[0]}">${dateTime[1]}</span>
                            </p>
                            </div>
                        </div>`;
        }
        else{
            messageDisplay += `<div class="row justify-content-end">                  
            <div class="col-6 col-sm-6 col-md-6">
                <p class="sent float-right"> ${msg}
                <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}  </span>
            </p>
            </div>
            <div class="col-2 col-sm-1 col-md-1">
                <img class="chat-pic rounded-circle" src="${firebase.auth().currentUser.photoURL}" alt="image">
            </div>
        </div>`;
        }
        });
        document.getElementById('messages').innerHTML = messageDisplay;
        document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight);
    });
}

function showChatList(){
    document.getElementById('side-1').classList.remove('d-none', 'd-md-block');
    document.getElementById('side-2').classList.add('d-none');
}

function hideChatList(){
    document.getElementById('side-1').classList.add('d-none', 'd-md-block');
    document.getElementById('side-2').classList.remove('d-none');
}


function sendMessage(){
    // var date = new Date();
    // var hour = date.getHours();
    // var minutes = date.getMinutes();
    // var time = hour + ':' + minutes;
    //${document.getElementsByClassName('time').innerHTML = time}
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('txtMessage').value,
        msgType:'normal',
        dateTime: new Date().toLocaleString()
    };
    //console.log(chatMessage);
    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error){
        if(error) {alert(error);
        }
        else{
//             var message = `<div class="row justify-content-end">                  
//     <div class="col-6 col-sm-6 col-md-6">
//         <p class="sent float-right"> ${document.getElementById('txtMessage').value}
//         <span class="time"> ${document.getElementsByClassName('time').innerHTML = chatMessage.dateTime} </span>
//     </p>
//     </div>
//     <div class="col-2 col-sm-1 col-md-1">
//         <img class="chat-pic rounded-circle" src="${firebase.auth().currentUser.photoURL}" alt="image">
//     </div>
// </div>`;

//     document.getElementById('messages').innerHTML += message;
     document.getElementById('txtMessage').value = '';
     document.getElementById('txtMessage').focus();
//     document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight);
        }
    });  
    
}
//----- Send Image /////////////////
function chooseImage(){
    document.getElementById('imageFile').click();
}
//----- How to send image----
function sendImage(event){
    var file = event.files[0];
    if(!file.type.match("image.*")){
    alert("please select image only");       
    }
    else{
        var reader = new FileReader();
        reader.addEventListener('load', function(){
            var chatMessage = {
                userId: currentUserKey,
                msg: reader.result,
                msgType:'image',
                dateTime: new Date().toLocaleString()
            };
            firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error){
                if(error) {alert(error);
                }
                else{
       
             document.getElementById('txtMessage').value = '';
             document.getElementById('txtMessage').focus();
                }
            });
        }, false);

        if(file){
            reader.readAsDataURL(file);
        }
    }
}

///////////////////////////////////////////////////////////

function loadChatList(){
    var db = firebase.database().ref('friend_list');
    db.on('value', function(lists){
        document.getElementById('lstChat').innerHTML=`<li class="list-group-item" style="background-color: #f8f8f8;">
        <input type="text" placeholder="search or new chat" class="form-control form-rounded">
    </li>`;
        lists.forEach(function(data){
            var lst = data.val();
            var friendKey = '';
            if(lst.friendId === currentUserKey){
                friendKey = lst.userId;
            }
            else if(lst.userId === currentUserKey){
                friendKey = lst.friendId;
            }
           if(friendKey !== '' && friendKey !== 1){
                firebase.database().ref('users').child(friendKey).on('value', function(data){
                    var user = data.val();
                    document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
                    <div class="row">
                        <div class="col-md-2">
                            <img src="${user.photoURL}" alt="image" class="friend-pic rounded-circle">
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

function populateUserList(){
    document.getElementById('lstUsers').innerHTML =`<div class="text-center">
                                                     <span class="spinner-border text-primary mt-5" style="width:7rem; height:7rem">
                                                    </div>`;                                          
    var db = firebase.database().ref('users');
    var dbNoti = firebase.database().ref('notifications');
    var lst = '';
    db.on('value', function(users){
        if(users.hasChildren()){
            lst = `<li class="list-group-item" style="background-color: #f8f8f8;">
            <input type="text" placeholder="search or new chat" class="form-control form-rounded">
        </li>`;
        document.getElementById('lstUsers').innerHTML = lst;
        }
        users.forEach(function(data){
            var user = data.val();
            if(user.email !== firebase.auth().currentUser.email){
                dbNoti.orderByChild('sendTo').equalTo(data.key).on('value', function(noti){
                    if( noti.numChildren() > 0 && Object.values(noti.val())[0].sendFrom === currentUserKey){
                        lst = `<li class="list-group-item list-group-item-action">
                        <div class="row">
                            <div class="col-md-2">
                                <img src="${user.photoURL}" alt="image" class="friend-pic rounded-circle">
                            </div>
                            <div class="col-md-10" style="cursor: pointer;">
                                <div class="name">${user.name}
                                <button class = "btn btn-sm btn-default" style = "float:right;"><i class="fas fa-user-plus"></i> Sent </button>
                                </div>
                                
                            </div>
                        </div>
                    </li>`;
                    document.getElementById('lstUsers').innerHTML += lst;
                    }
                    else{
                        lst = `<li class="list-group-item list-group-item-action" data-dismiss = "modal">
                        <div class="row">
                            <div class="col-md-2">
                                <img src="${user.photoURL}" alt="image" class="friend-pic rounded-circle">
                            </div>
                            <div class="col-md-10" style="cursor: pointer;">
                                <div class="name">${user.name}
                                <button onclick = "sendRequest('${data.key}')" class = "btn btn-sm btn-primary" style = "float:right;"><i class="fas fa-user-plus"></i> send request </button>
                                </div>
                                
                            </div>
                        </div>
                    </li>`;
                    document.getElementById('lstUsers').innerHTML += lst;
                    }
                });
               
            }
             
        });
        
    });
}

function notificationCount(){
    let db = firebase.database().ref('notifications');
    db.orderByChild('sendTo').equalTo(currentUserKey).on('value', function(noti){
        let notiArray = Object.values(noti.val()).filter(n => n.status === 'pending');
        document.getElementById('notification').innerHTML = notiArray.length;
    });
}

function sendRequest(key){
    let notification ={
        sendTo:key,
        sendFrom: currentUserKey,
        name:firebase.auth().currentUser.displayName,
        photo:firebase.auth().currentUser.photoURL,
        dateTime: new Date().toLocaleString(),
        status:'pending'
    };
    firebase.database().ref('notifications').push(notification, function (error){
        if(error) alert(error);
        else{
            populateUserList();
        }
    });
}

function populateNotifications(){
    document.getElementById('lstNotification').innerHTML =`<div class="text-center">
                                                     <span class="spinner-border text-primary mt-5" style="width:7rem; height:7rem">
                                                    </div>`;                                          
    var db = firebase.database().ref('notifications');
    var lst = '';
    db.orderByChild('sendTo').equalTo(currentUserKey).on('value', function(notis){
        if(notis.hasChildren()){
            lst = `<li class="list-group-item" style="background-color: #f8f8f8;">
            <input type="text" placeholder="search or new chat" class="form-control form-rounded">
        </li>`;
        }
        notis.forEach(function(data){
            var noti = data.val();
            if(noti.status === 'pending'){
                lst += `<li class="list-group-item list-group-item-action">
             <div class="row">
                 <div class="col-md-2">
                     <img src="${noti.photo}" alt="image" class="friend-pic rounded-circle">
                 </div>
                 <div class="col-md-10" style="cursor: pointer;">
                     <div class="name">${noti.name}
                     <button onclick = "reject('${data.key}')" class = "btn btn-sm btn-danger" style = "float:right; margin-left:1%;"><i class="fas fa-user-times"></i> Reject </button>
                     <button onclick = "accept('${data.key}')" class = "btn btn-sm btn-success" style = "float:right;"><i class="fas fa-user-check"></i> Accept </button>
                     </div>
                     
                 </div>
             </div>
         </li>`;
            }    
        });
        document.getElementById('lstNotification').innerHTML = lst;
    });
}

function reject(key){
    let db =  firebase.database().ref('notifications').child(key).once('value',function (noti){
        let obj = noti.val();
        obj.status = "Reject";
        firebase.database().ref('notifications').child(key).update(obj, function(error){
            if(error) alert(error);
            else{
                populateNotifications();
            }
        });
    });
}

function accept(key){
    let db =  firebase.database().ref('notifications').child(key).once('value',function (noti){
        var obj = noti.val();
        obj.status = "Accept";
        firebase.database().ref('notifications').child(key).update(obj, function(error){
            if(error) alert(error);
            else{
                populateNotifications();
                var friendList = {friendId: obj.sendFrom, userId: obj.sendTo};
                firebase.database().ref('friend_list').push(friendList, function(error){
                    if(error) alert(error);
                    else{
                        // do something
                    }
                });
            }
        });
    });
}

function populateFriendList(){
    // document.getElementById('lstFriend').innerHTML =`<div class="text-center">
    //                                                  <span class="spinner-border text-primary mt-5" style="width:7rem; height:7rem">
    //                                                 </div>`;                                          
    // var db = firebase.database().ref('users');
    // var lst = '';
    // db.on('value', function(users){
    //     if(users.hasChildren()){
    //         lst = `<li class="list-group-item" style="background-color: #f8f8f8;">
    //         <input type="text" placeholder="search or new chat" class="form-control form-rounded">
    //     </li>`;
    //     }
    //     users.forEach(function(data){
    //         var user = data.val();
    //         if(user.email !== firebase.auth().currentUser.email){
    //             lst += `<li class="list-group-item list-group-item-action" data-dismiss = "modal" onclick="startChat('${data.key}','${user.name}','${user.photoURL}')">
    //          <div class="row">
    //              <div class="col-md-2">
    //                  <img src="${user.photoURL}" alt="image" class="friend-pic rounded-circle">
    //              </div>
    //              <div class="col-md-10" style="cursor: pointer;">
    //                  <div class="name">${user.name}</div>
                     
    //              </div>
    //          </div>
    //      </li>`;
    //         }
             
    //     });
    //     document.getElementById('lstFriend').innerHTML = lst;
    // });                                                 
}


////---------------including firebase------------////
function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
    //var provider2 = new firebase.auth.OAuthProvider('yahoo.com');
    //firebase.auth().signInWithPopup(provider2);
}

function signOut(){
    firebase.auth().signOut();
}

function authStateListner(){
    firebase.auth().onAuthStateChanged(onStatChanged);
}
    
function onStatChanged(user) {
        if(user){
            //alert(firebase.auth().currentUser.email + '\n'+ firebase.auth().currentUser.displayName);
    // -------------Storing user details to firebase----------
            var userProfile = {email:" ", name:" ", photoURL:" "};
    
            userProfile.email = firebase.auth().currentUser.email;
            userProfile.name = firebase.auth().currentUser.displayName;
            userProfile.photoURL = firebase.auth().currentUser.photoURL;
            //console.log(firebase.auth().currentUser.displayName);
            var db = firebase.database().ref('users');
            var flag = false;
            db.on('value', function(users){
                users.forEach(function(data){
                    var user = data.val();
                    if(user.email === userProfile.email){
                        currentUserKey = data.key;
                        flag = true;
                    }
                });
                if(flag === false){
                    firebase.database().ref('users/').push().set(userProfile, callback)
                }
                else{
                    document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;
 
        document.getElementById('lnkSignIn').style = 'display:none';
        document.getElementById('lnkSignOut').style = 'display:block';
                }

          const messaging = firebase.messaging();
            messaging.requestPermission().then(function(){
                return messaging.getToken();
            }).then(function(token){
                firebase.database().ref('fcmTokens').child(currentUserKey).set({token_id: token});
            })

                document.getElementById('lnkNewChat').classList.remove('disabled');

                loadChatList();
                notificationCount();
            });

            
        }
        else{
            document.getElementById('imgProfile').src = 'images/pp.png';
            document.getElementById('imgProfile').title = '';
    
            document.getElementById('lnkSignIn').style = 'display:block';
            document.getElementById('lnkSignOut').style = 'display:none';

            document.getElementById('lnkNewChat').classList.add('disabled');
        } 
    
}

function callback(error){
    if (error){
        alert(error);
    }
    else{
        document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('imgProfile').title = firebase.auth().currentUser.displayName;
 
        document.getElementById('lnkSignIn').style = 'display:none';
        document.getElementById('lnkSignOut').style = 'display:block';
    }
}

//---- call auth state changed function ------
authStateListner();


