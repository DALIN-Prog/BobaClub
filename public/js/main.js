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
      .textContent.trim();
    const bColText = b
      .querySelector(`td:nth-child(${column + 1})`)
      .textContent.trim();

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
