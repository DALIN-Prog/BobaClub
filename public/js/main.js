// for deleting drinks
$(document).ready(() => {
  $(".delete-drink").on("click", (e) => {
    $target = $(e.target);
    const id = $target.attr("data-ID");
    const userID = $target.attr("data-shopID");
    $.ajax({
      type: "DELETE",
      url: "/shop/drinks/" + id,
      beforeSend: () => {
        return confirm("Are you sure?");
      },
      success: (response) => {
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
      beforeSend: () => {
        return confirm("Are you sure?");
      },
      success: (response) => {
        window.location.href = "/forum/1";
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
      beforeSend: () => {
        return confirm("Are you sure?");
      },
      success: (response) => {
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
      beforeSend: () => {
        return confirm("Are you sure?");
      },
      success: (response) => {
        window.location.href = "/drinks/" + userID;
      },
      error: (err) => {
        console.log(err);
      },
    });
  });
});

// favourite post
function doFav() {
  $(document).ready(() => {
    var x = document.getElementById("fav");
    const id = x.getAttribute("data-fav");
    console.log("This is: " + (x.innerHTML === "Favourite"));
    if (x.innerHTML === "Favourite") {
      $.ajax({
        type: "POST",
        url: "/doFavourite/" + id,
        success: (response) => {
          x.innerHTML = "Favourited";
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: "/doUnfavourite/" + id,
        success: (response) => {
          x.innerHTML = "Favourite";
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  });
}

// unfavourite post
function doUnFav() {
  $(document).ready(() => {
    var x = document.getElementById("unfav");
    const id = x.getAttribute("data-fav");
    console.log(x.innerHTML);
    console.log("This is: " + (x.innerHTML === "Favourited"));
    if (x.innerHTML === "Favourited") {
      $.ajax({
        type: "POST",
        url: "/doUnfavourite/" + id,
        success: (response) => {
          x.innerHTML = "Favourite";
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: "/doFavourite/" + id,
        success: (response) => {
          x.innerHTML = "Favourited";
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  });
}

// favourite drink
function doFavDrink(clicked_id) {
  $(document).ready(() => {
    console.log("clicked id: " + clicked_id);
    var x = document.getElementById(clicked_id);
    const id = x.getAttribute("data-fav");
    //console.log("inner html: " + x.innerHTML);
    console.log("This is: " + (x.getAttribute("title") === "Wishlist"));
    if (x.getAttribute("title") === "Wishlist") {
      $.ajax({
        type: "POST",
        url: "/drink/favourite/" + id,
        success: (response) => {
          x.innerHTML =
            'Wishlisted <i class="fas fa-heart" style="color: #ec5252;"></i>';
          $("#" + clicked_id).attr("title", "Unwishlist");
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: "/drink/unfavourite/" + id,
        success: (response) => {
          x.innerHTML = 'Wishlist <i class="far fa-heart"></i>';
          $("#" + clicked_id).attr("title", "Wishlist");
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  });
}

// unfavourite drink
function doUnFavDrink(clicked_id) {
  $(document).ready(() => {
    console.log("clicked id: " + clicked_id);
    var x = document.getElementById(clicked_id);
    const id = x.getAttribute("data-fav");
    //console.log("inner html: " + x.innerHTML);
    console.log("This is: " + (x.getAttribute("title") === "Unwishlist"));
    if (x.getAttribute("title") === "Unwishlist") {
      $.ajax({
        type: "POST",
        url: "/drink/unfavourite/" + id,
        success: (response) => {
          x.innerHTML = 'Wishlist <i class="far fa-heart"></i>';
          $("#" + clicked_id).attr("title", "Wishlist");
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: "/drink/favourite/" + id,
        success: (response) => {
          x.innerHTML =
            'Wishlisted <i class="fas fa-heart" style="color: #ec5252;"></i>';
          $("#" + clicked_id).attr("title", "Unwishlist");
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  });
}

// like post
function doLike(clicked_id) {
  $(document).ready(() => {
    console.log(clicked_id);
    var x = document.getElementById(clicked_id);
    const id = x.getAttribute("data-like");

    console.log("This is: " + (x.getAttribute("title") === "Like"));
    if (x.getAttribute("title") === "Like") {
      $.ajax({
        type: "POST",
        url: "/doLike/" + id,
        success: (response) => {
          $("#" + clicked_id).css("color", "#03658c");
          $("#" + clicked_id).attr("title", "Unlike");
          document.getElementById("count" + clicked_id).innerHTML++;
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: "/doUnlike/" + id,
        success: (response) => {
          $("#" + clicked_id).css("color", "#a6a6a6");
          $("#" + clicked_id).attr("title", "Like");
          document.getElementById("count" + clicked_id).innerHTML--;
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  });
}

// unlike post
function doUnlike(clicked_id) {
  $(document).ready(() => {
    console.log(clicked_id);
    var x = document.getElementById(clicked_id);
    const id = x.getAttribute("data-like");
    console.log("This is: " + (x.getAttribute("title") === "Unlike"));
    if (x.getAttribute("title") === "Unlike") {
      $.ajax({
        type: "POST",
        url: "/doUnlike/" + id,
        success: (response) => {
          $("#" + clicked_id).css("color", "#a6a6a6");
          $("#" + clicked_id).attr("title", "Like");
          document.getElementById("count" + clicked_id).innerHTML--;
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: "/doLike/" + id,
        success: (response) => {
          $("#" + clicked_id).css("color", "#03658c");
          $("#" + clicked_id).attr("title", "Like");
          document.getElementById("count" + clicked_id).innerHTML++;
          console.log(response);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  });
}

// ---------- forum table sorting ------------------- //

/**
 * Sorts a HTML table.
 *
 * @param {HTMLTableElement} table The table to sort
 * @param {number} column The index of the column to sort
 * @param {boolean} asc Determines if the sorting will be in ascending
 */
function sortTableByColumn(table, column, asc = true) {
  const dirModifier = asc ? 1 : -1;
  const tBody = table.tBodies[0];
  const rows = Array.from(tBody.querySelectorAll("tr"));

  // Sort each row
  const sortedRows = rows.sort((a, b) => {
    const aColText = a
      .querySelector(`td:nth-child(${column + 1})`)
      .textContent.trim()
      .toLowerCase();
    const bColText = b
      .querySelector(`td:nth-child(${column + 1})`)
      .textContent.trim()
      .toLowerCase();

    return aColText > bColText ? 1 * dirModifier : -1 * dirModifier;
  });

  // Remove all existing TRs from the table
  while (tBody.firstChild) {
    tBody.removeChild(tBody.firstChild);
  }

  // Re-add the newly sorted rows
  tBody.append(...sortedRows);

  // Remember how the column is currently sorted
  table
    .querySelectorAll("th")
    .forEach((th) => th.classList.remove("th-sort-asc", "th-sort-desc"));
  table
    .querySelector(`th:nth-child(${column + 1})`)
    .classList.toggle("th-sort-asc", asc);
  table
    .querySelector(`th:nth-child(${column + 1})`)
    .classList.toggle("th-sort-desc", !asc);
}

document.querySelectorAll(".table-sortable th").forEach((headerCell) => {
  headerCell.addEventListener("click", () => {
    const tableElement = headerCell.parentElement.parentElement.parentElement;
    const headerIndex = Array.prototype.indexOf.call(
      headerCell.parentElement.children,
      headerCell
    );
    const currentIsAscending = headerCell.classList.contains("th-sort-asc");

    sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
  });
});
