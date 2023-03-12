function startApp() {
  const kinveyBaseUrl = "https://baas.kinvey.com/";
  const kinveyAppKey = "kid_Syp_9U9J3";
  const kinveyAppSecret = "f4a09dccbf4948bdbf2a974c7848d5e1";
  const kinveyAppAuthHeaders = {
    Authorization: "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret),
  };

  sessionStorage.clear();
  showHideMenuLinks();

  $("#linkHome").click(showHomeView);
  $("#linkLogin").click(showLoginView);
  $("#linkRegister").click(showRegisterView);
  $("#linkListBooks").click(listBooks);
  $("#linkCreateBook").click(showCreateBookView);
  $("#linkLogout").click(logoutUser);

  $("#buttonLoginUser").click(loginUser);
  $("#buttonRegisterUser").click(registerUser);
  $("#buttonCreateBook").click(createBook);
  $("#buttonEditBook").click(editBook);

  function showHideMenuLinks() {
    if (sessionStorage.getItem("authToken")) {
      $("#linkLogin").hide();
      $("#linkRegister").hide();
      $("#linkListBooks").show();
      $("#linkCreateBook").show();
      $("#linkLogout").show();
    } else {
      $("#linkLogin").show();
      $("#linkRegister").show();
      $("#linkListBooks").hide();
      $("#linkCreateBook").hide();
      $("#linkLogout").hide();
    }
  }

  function showHomeView() {
    showView("viewHome");
  }

  function showRegisterView() {
    //clears the input fields
    $("#formRegister").trigger("reset");
    showView("viewRegister");
  }

  function showLoginView() {
    //clears the input fields
    $("#formLogin").trigger("reset");
    showView("viewLogin");
  }

  function showCreateBookView() {
    //clears the input fields
    $("#formCreateBook").trigger("reset");
    showView("viewCreateBook");
  }

  function showEditBookView() {
    //clears the input fields
    $("#formEditBook").trigger("reset");
    showView("viewEditBook");
  }

  function showView(viewName) {
    $("main > section").hide();
    $("#" + viewName).show();
  }

  $("#infoBox, #errorBox").click(function () {
    $(this).fadeOut();
  });

  $(document).on({
    ajaxStart: function () {
      $("#loadingBox").show();
    },
    ajaxStop: function () {
      $("#loadingBox").hide();
    },
  });

  function loginUser() {
    let userData = {
      username: $("#formLogin input[name=username]").val(),
      password: $("#formLogin input[name=password]").val(),
    };

    $.ajax({
      method: "POST",
      url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
      headers: kinveyAppAuthHeaders,
      data: userData,
      success: loginSuccess,
      error: handleAjaxError,
    });
  }

  function registerUser() {
    let userData = {
      username: $("#formRegister input[name=username]").val(),
      password: $("#formRegister input[name=password]").val(),
    };

    $.ajax({
      method: "POST",
      url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
      headers: kinveyAppAuthHeaders,
      data: userData,
      success: registerSuccess,
      error: handleAjaxError,
    });
  }

  function listBooks() {
    showView("viewBooks");
    $("#books").empty();

    $.ajax({
      method: "GET",
      url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Books",
      headers: getKinveyUserAuthHeaders(),
      success: loadBooksSuccess,
      error: handleAjaxError,
    });

    function loadBooksSuccess(books) {
      showInfo("Books loaded.");
      console.log(books);

      if (books.length == 0) {
        $("#books").text("No books");
      } else {
        //console.table(books);
        let booksTable = $("<table>")
          .append($("<tr>"))
          .append(
            "<th>Id</th><th>Title</th><th>Author</th>",
            "<th>Description</th><th>Action</th>"
          );

        for (let book of books) {
          appendBookRow(book, booksTable);
        }
        $("#books").append(booksTable);
      }

      function appendBookRow(book, booksTable) {
        let links = [];

        let deleteLink = $('<a href="#">[delete]</a>').click(function () {
          deleteBook(book);
        });

        let editLink = $('<a href="#">[edit]</a>').click(function () {
          loadBookForEdit(book);
        });

        links = [deleteLink, " ", editLink];

        booksTable
          .append($("<tr>"))
          .append(
            $("<td>").text(book._id),
            $("<td>").text(book.title),
            $("<td>").text(book.author),
            $("<td>").text(book.description),
            $("<td>").append(links)
          );
      }
    }
  }

  function saveAuthInSession(userInfo) {
    let userAuth = userInfo._kmd.authtoken;
    sessionStorage.setItem("authToken", userAuth);
    let userId = userInfo._id;
    sessionStorage.setItem("userId", userId);
    let username = userInfo.username;
    $("#loggedInUser").text("Welcome, " + username + "!");
  }

  function createBook() {
    let bookData = {
      title: $("#formCreateBook input[name=title]").val(),
      author: $("#formCreateBook input[name=author]").val(),
      description: $("#formCreateBook input[name=descr]").val(),
    };

    console.log(bookData);

    $.ajax({
      method: "POST",
      url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Books",
      headers: getKinveyUserAuthHeaders(),
      data: bookData,
      success: createBookSuccess,
      error: handleAjaxError,
    });

    function createBookSuccess() {
      listBooks();
      showInfo("Book created!");
    }
  }

  function loadBookForEdit(book) {
    $.ajax({
      method: "GET",
      url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Books/" + book._id,
      headers: getKinveyUserAuthHeaders(),
      success: loadBookForEditSuccess,
      error: handleAjaxError,
    });

    function loadBookForEditSuccess(book) {
      $("#formEditBook input[name=id]").val(book._id),
        $("#formEditBook input[name=title]").val(book.title),
        $("#formEditBook input[name=author]").val(book.author),
        $("#formEditBook input[name=descr]").val(book.description);

      showView("viewEditBook");
    }
  }

  function editBook() {
    let bookData = {
      title: $("#formEditBook input[name=title]").val(),
      author: $("#formEditBook input[name=author]").val(),
      description: $("#formEditBook input[name=descr]").val(),
    };

    console.log(bookData);

    $.ajax({
      method: "PUT",
      url:
        kinveyBaseUrl +
        "appdata/" +
        kinveyAppKey +
        "/Books/" +
        $("#formEditBook input[name=id]").val(),
      headers: getKinveyUserAuthHeaders(),
      data: bookData,
      success: editBookSuccess,
      error: handleAjaxError,
    });

    function editBookSuccess() {
      listBooks();
      showInfo("Book edited!");
    }
  }

  function deleteBook(book) {
    $.ajax({
      method: "DELETE",
      url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/Books/" + book._id,
      headers: getKinveyUserAuthHeaders(),
      success: deleteBookSuccess,
      error: handleAjaxError,
    });

    function deleteBookSuccess() {
      listBooks();
      showInfo("Book deleted!");
    }
  }

  function loginSuccess(userInfo) {
    saveAuthInSession(userInfo);
    showHideMenuLinks();
    showHomeView();
    showInfo("Login successful!");
  }

  function registerSuccess(userInfo) {
    saveAuthInSession(userInfo);
    showHideMenuLinks();
    showHomeView();
    showInfo("User registration successful!");
  }

  function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response);
    if (response.readyState === 0) {
      errorMsg = "Cannot connect due to network error.";
    }
    if (response.responseJSON && response.responseJSON.description) {
      errorMsg = response.responseJSON.description;
    }

    showError(errorMsg);
  }

  function logoutUser() {
    sessionStorage.clear();
    $("#loggedInUser").text("");
    showHideMenuLinks();
    showView("viewHome");
    showInfo("Logout successful.");
  }

  function showInfo(message) {
    $("#infoBox").text(message);
    $("#infoBox").show();
    setTimeout(function () {
      $("#infoBox").fadeOut();
    }, 3000);
  }

  function showError(message) {
    $("#errorBox").text(message);
    $("#errorBox").show();
    setTimeout(function () {
      $("#errorBox").fadeOut();
    }, 3000);
  }

  function getKinveyUserAuthHeaders() {
    return {
      Authorization: "Kinvey " + sessionStorage.getItem("authToken"),
    };
  }
}
