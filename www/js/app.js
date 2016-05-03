// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform, $rootScope, $ionicLoading) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
 
    $rootScope.toggle = function(text, timeout) {
      $rootScope.show(text);
 
      setTimeout(function() {
        $rootScope.hide();
      }, (timeout || 1000));
    };
 
    $rootScope.show = function(text) {
      $ionicLoading.show({
        template: text
      });
    };
 
    $rootScope.hide = function() {
      $ionicLoading.hide();
    };
  });
})


//Main controller
.controller('MainCtrl', ['$window', '$ionicPlatform', '$rootScope', '$scope', '$ionicScrollDelegate', '$ionicModal','$state',
  function($window, $ionicPlatform, $rootScope, $scope, $ionicScrollDelegate, AudioSvc, $ionicModal, $state) {
    $scope.files = [];
    $scope.videodetails = [];

    //Function for fetch video files from ionicrecorder folder from memory and set in list
    $scope.func = function(){
        $rootScope.show('Accessing Videos.. Please wait');
        $window.requestFileSystem($window.LocalFileSystem.PERSISTENT, 0, function(fs) {

          fs.root.getDirectory('ionicrecorder', {create: true}, function(dirEntry){
                  var dirReader = dirEntry.createReader();
                  dirReader.readEntries(function(entries) {
                    if(entries.length === 0){
                      alert("No Videos available...");
                      $rootScope.hide();
                    }
                      var arr = [];
                      processEntries(entries, arr, function(arr) {
                        $scope.files = $scope.dup;
                        $rootScope.hide();
                      }); // arr is pass by refrence
                  }, onError);
                }, onError);
 
            //Error
                function onError(error) {
                    alert("Failed to list directory contents: " + error.code);
                }
        },
        function(error) {
          console.log(error);
        });
    }
    

    $scope.func();

    //Share video function
    $scope.shr = function(file){
      window.plugins.socialsharing.share(file.name, '', file.nativeURL);
    }

    // Delete video function
    $scope.dlt = function(file){
      var conf = confirm("Are you sure you want to delete this video?");
      if(conf){
        var relativeFilePath = file.fullPath;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
            fileSystem.root.getFile(relativeFilePath, {create:false}, function(fileEntry){
                fileEntry.remove(function(file){
                    console.log("File removed!");
                },function(){
                    console.log("error deleting the file " + error.code);
                    });
                },function(){
                    console.log("file does not exist");
                });
            },function(evt){
                console.log(evt.target.error.code);
        });
        $scope.func();
      }else{
        return;
      }
      
    }


    //Function when video capture button called
    $scope.clicked = function(){
      var self =this;
      // capture callback for mediacapture which is open video recording
      var captureSuccess = function(mediaFiles) {
          var i, path, len;
          for (i = 0, len = mediaFiles.length; i < len; i += 1) {
              path = mediaFiles[i].fullPath;
              var name = prompt("Please Enter video name.. ");

              //Return from function if user cancel prompt
              if(name === null){
                return;
              }

              // Async call of video name and if user not give video name set time stamp as name
              async.each(mediaFiles, function(file, callback) {

                  var video = document.createElement('video');
                  video.preload = 'metadata';
                  video.src = mediaFiles[i].fullPath;;

                  video.addEventListener("loadedmetadata", function(ev) {

                    if(name.trim() === ""){
                      name = new Date().getTime();
                    }
                    callback();
                  });

                }, function(err){
                    // if any of the file processing produced an error, err would equal that error
                    if( err ) {
                      // One of the iterations produced an error.
                      // All processing will now stop.
                      console.log('A file failed to process');
                    } else {
                      // Store new video which is taken by mediacapture and save it in "ionicrecorder" folder
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs) {
                      fs.root.getDirectory(
                          "ionicrecorder",
                          {
                              create: true
                          },
                          function(dirEntry) {
                              dirEntry.getFile(
                                  name + ".mp4", 
                                  {
                                      create: true, 
                                      exclusive: false
                                  }, 
                                  function gotFileEntry(fe) {
                                      var p = fe.toURL();
                                      fe.remove();
                                      ft = new FileTransfer();
                                      ft.download(
                                          encodeURI(path),
                                          p,
                                          function(entry) { 
                                              $scope.imgFile = entry.toURL();
                                          },
                                          function(error) {
                                              
                                              alert("Download Error Source -> " + error.source);
                                          },
                                          false,
                                          null
                                      );
                                      $scope.func();
                                  }, 
                                  function() {
                                      
                                      console.log("Get file failed");
                                  }
                              );
                          }
                          );
                      });
                      console.log('All files have been processed successfully');
                    }
                });
          }
      };

      // capture error callback
      var captureError = function(error) {
          navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
      };

      // start video capture
      navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1});
    };
    
    //Function for play video
    $scope.showFile = function(file) {
        if (hasExtension(file.name)) {
          if (file.name.indexOf('.mp4') > 0) {
            // Stop the audio player before starting the video
           // $scope.stopAudio();
           // VideoPlayer.play(file.nativeURL);
           var videoUrl = file.nativeURL;

           var options = {
            successCallback: function() {
              console.log("Player closed without error.");
            },
            errorCallback: function(errMsg) {
              console.log("Error! " + errMsg);
            }
          };

          // Just play a video
          window.plugins.streamingMedia.playVideo(videoUrl, options);
          } else {
            alert("File is not video file")
          }
        } else {
          $rootScope.toggle('Oops! We cannot play this file :/', 3000);
        }

    }
 
 
    function hasExtension(fileName) {
      var exts = ['.mp3', '.m4a', '.ogg', '.mp4', '.aac'];
      return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
    }
    
    // Funtion for get file data which is called by $scpoe.func()
    function processEntries(entries, arr, callback) {
  
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        // do not push/show hidden files or folders
        if (e.name.indexOf('.') !== 0) {
          arr.push({
            id: i+1 ,
            name: e.name,
            nativeURL: e.nativeURL,
            fullPath: e.fullPath
          });
        }
      }

      $scope.dup = arr;
      var durat = [];
    
      async.eachSeries(arr, function(file, callback) {
        var video = document.createElement('video');
        video.preload = 'metadata';
        video.src = file.nativeURL;

        video.addEventListener("loadedmetadata", function(ev) {
          String.prototype.toHHMMSS = function () {
              var sec_num = parseInt(this, 10); // don't forget the second param
              var hours   = Math.floor(sec_num / 3600);
              var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
              var seconds = sec_num - (hours * 3600) - (minutes * 60);

              if (hours   < 10) {hours   = "0"+hours;}
              if (minutes < 10) {minutes = "0"+minutes;}
              if (seconds < 10) {seconds = "0"+seconds;}
              var time    = hours+':'+minutes+':'+seconds;
              return time;
          }
          var t = video.duration;
          var nm = t.toString();
          name = nm.toHHMMSS();
          durat.push( name );
          callback();
        });

      }, function(err){
          if( err ) {
            console.log('A file failed to process');
          } else {
            for(i=0; i<=durat.length -1 ;i++){
              $scope.dup[i].duration = durat[i];
            }
            setTimeout(function(){
              $scope.videodetails = $scope.dup;
              callback($scope.videodetails);
            },10,true);
            console.log('All files have been processed successfully' );
          }
      });
    }
  }
])

//End of controller