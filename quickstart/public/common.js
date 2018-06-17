$(function(){

  $("#inverted").click(function(){
    console.log($("#remote-media video").css("transform"));
    if($("#remote-media video").css("transform") == "matrix(-1, 0, 0, 1, 0, 0)") {
      $("#remote-media video").css("transform","scale(1,1)");
    }
    else {
      $("#remote-media video").css("transform","scale(-1,1)");
    }
    console.log("inverted!");
  });

  $("#roomA").click(function(){
    $("#room-name").val("roomA");
    $("#button-join").click();
  });

  $("#roomB").click(function(){
    $("#room-name").val("roomB");
    $("#button-join").click();
  });
  
});