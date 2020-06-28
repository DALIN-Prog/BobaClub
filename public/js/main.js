// for deleting drinks
$(document).ready(() => {
  $(".delete-drink").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-ID");
    const userID = $target.attr("data-shopID");
    $.ajax({
      type: "DELETE",
      url: "/shop/drinks/" + id,
      success: (response) => {
        alert("Deleting Drink post");
        window.location.href = "/shops/" + userID;
      },
      error: (err) => {
        console.log(err);
      },
    });
  });
});

// for editing drink comment
$(document).ready(() => {
  $(".edit-drinkComment").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-editDrinkID");
    //console.log(id);
    $("#popOutFormDrink").attr("action", "/drink/comment/edit/" + id);
  });
});

// for deleting post
$(document).ready(() => {
  $(".delete-post").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-mainPostID");
    //alert(id);
    $.ajax({
      type: "DELETE",
      url: "/forum/posts/" + id,
      success: (response) => {
        alert("Deleting post");
        window.location.href = "/forum";
      },
      error: (err) => {
        console.log(err);
      },
    });
  });
});

// for editing post comment
$(document).ready(() => {
  $(".edit-comment").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-editID");
    //console.log(id);
    $("#popOutForm").attr("action", "/post/comment/edit/" + id);
  });
});

// for deleting post comment
$(document).ready(() => {
  $(".delete-comment").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-commentID");
    const userID = $target.attr("data-postID");
    $.ajax({
      type: "DELETE",
      url: "/post/comments/" + id,
      success: (response) => {
        alert("Deleting post comment");
        window.location.href = "/posts/" + userID;
      },
      error: (err) => {
        console.log(err);
      },
    });
  });
});

// for deleting drink comment
$(document).ready(() => {
  $(".delete-drinkComment").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-drinkCommentID");
    const userID = $target.attr("data-drinkID");
    $.ajax({
      type: "DELETE",
      url: "/drink/comments/" + id,
      success: (response) => {
        alert("Deleting drink comment");
        window.location.href = "/drinks/" + userID;
      },
      error: (err) => {
        console.log(err);
      },
    });
  });
});
