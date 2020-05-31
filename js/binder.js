currentUser = {};

function setCurrentUser(user) {
  currentUser = user;
  stateView();
}

function inputEnter(event, input) {

  const char = event.code;
  const key = event.key;
  if (char === 'Enter' || key === 'Enter') {
    if (input === "login") {
      getUserByUsername();
    } else if (input === "booksearch") {
      getBooksFromGoogle();
    }
  }
}

function stateView() {
  console.log("currentUser on stateView: ", currentUser);

  if (currentUser.id != undefined) {
    $(".limiter").addClass("d-none");
    $("#main").removeClass("d-none");
    $(".bg-image").removeClass("d-none");
    updateHeader();
    $("#table").addClass("d-none");
    $("#conteudo").removeClass("d-none");
    $("#accordionExample").removeClass("d-none");
    $(".notFound").addClass("d-none");
  } else {
    $(".limiter").removeClass("d-none");
    $("#main").addClass("d-none");
    $(".bg-image").addClass("d-none");
  }
}

function updateHeader() {
  $("#currentUsername").html(`Welcome ${currentUser.username}`);
}

function getUserByUsername() {
  let username = $("#username").val();

  $.get('https://upacademytinder.herokuapp.com/api/users/?filter={"where":{"username":"' + username + '"},"include":"books"}')
    .done((data) => {
      (data.length == 0) ? addUser(username) : setCurrentUser(data[0]);
      table();
      $("#table").addClass("d-none ");
      booksOnUser = data[0].books;
      console.log("GET booksOnUser: ", booksOnUser);
    }).fail((err) => {
      console.error("Erro : ", err);
    });

  getData();
}

function addUser(username) {
  let tempUser = {
    username: username
  }
  $.post('https://upacademytinder.herokuapp.com/api/users',
    tempUser).done((data) => {
      setCurrentUser(data);
    }).fail((err) => {
      console.error("Erro : ", err);
    });
}

function deleteUserById() {
  $.ajax({
    url: 'https://upacademytinder.herokuapp.com/api/users/' +
      currentUser.id,
    type: 'DELETE',
    success: () => {
      console.log("Deleted ");
      setCurrentUser();
    }
  });
}

function updateUserById() {
  currentUser.username = $("#currentUsername ").val();
  $.ajax({
    url: 'https://upacademytinder.herokuapp.com/api/users/' + currentUser.id,
    type: 'PUT',
    data: currentUser,
    success: (user) => {
      console.log("Updated ");
      setCurrentUser(user);
    }
  });
}

function addBook() {
  let tempBook = {
    name: $("#bookName ").val()
  }
  $.post('https://upacademytinder.herokuapp.com/api/users/' + currentUser.id + '/books',
    tempBook).done((data) => {
      console.log("User api books saved", data);
    }).fail((err) => {
      console.error("Erro : ", err);
    });
}

function getBooksFromGoogle() {
  let filter = $("#search").val();
  console.log("getBooksFromGoogle function: ", filter);
  flag = false;
  getDataFilter(filter);
}

function logout() {
  $("#username").val('');
  currentUser = {};
  stateView();
  books = [];
  i = 0;
  flag = false;
  tableData = [];
  BooksAGuardar = [];
  console.log(BooksAGuardar, "tableData:", tableData);

}

class Book {
  constructor(title, description, img, id, link, like) {
    this.title = title;
    this.description = description;
    this.img = img;
    this.bookId = id;
    this.link = link;
    this.like = like;
  }
}

let books = [];
let booksOnUser = [];
let i = 0;
let BooksAGuardar = [{}];
let flag = false;
let tableData = [];
let exist = false;

function getDataFilter(filter) {
  $.get("https://www.googleapis.com/books/v1/volumes?q=" + filter)
    .done(function (data) {
      console.log("filter: ", filter);
      $("#search").val('');
      books = [];
      for (index = 0; index < data.items.length; index++) {
        let element = data.items[index];
        let img = "";
        if (element["volumeInfo"]["description"] == undefined) {
          element["volumeInfo"]["description"] = "Sorry, no description available!";
        }
        if (element["saleInfo"]["buyLink"] == undefined) {
          element["saleInfo"]["buyLink"] = "No link available"
        }
        if (element["volumeInfo"]["imageLinks"] == undefined) {
          img = "https://jberlife.com/wp-content/uploads/2019/07/sorry-image-not-available.jpg";
        }
        else {
          img = element["volumeInfo"]["imageLinks"]["smallThumbnail"];
        }

        let book = new Book(element["volumeInfo"]["title"], element["volumeInfo"]["description"], img, element["id"], element["saleInfo"]["buyLink"]);
        books.push(book);
      }
      i = 0;
      console.log("Books Filtered: ", books);
      if (flag == false) {
        ecraInicial();
        flag = true;
      }

    })
    .fail(function (data) {
      console.error("Erro : ", data);
    });
}



function getData() {
  $("#table").addClass("d-none ");
  $("#conteudo").removeClass("d-none");
  $("#accordionExample").removeClass("d-none");


  $.get(`https://www.googleapis.com/books/v1/volumes?q='-term'&startIndex=${i}`)
    .done(function (data) {
      console.log("getAll data: ", data);
      for (let index = 0; index < data.items.length; index++) {
        let element = data.items[index];
        let img = "";
        if (element["volumeInfo"]["description"] == undefined) {
          element["volumeInfo"]["description"] = "Sorry, no description available!";
        }
        if (element["saleInfo"]["buyLink"] == undefined) {
          element["saleInfo"]["buyLink"] = "No link available"
        }
        if (element["volumeInfo"]["imageLinks"] == undefined) {
          img = "https://jberlife.com/wp-content/uploads/2019/07/sorry-image-not-available.jpg";
        }
        else {
          img = element["volumeInfo"]["imageLinks"]["smallThumbnail"];
        }

        let book = new Book(element["volumeInfo"]["title"], element["volumeInfo"]["description"], img, element["id"], element["saleInfo"]["buyLink"]);
        books.push(book);
      }
      console.log("All 10 books: ", books, "startindex: ", i);
      if (flag == false) {
        ecraInicial();
        flag = true;
      }
    })
    .fail(function (data) {
      console.error("Erro : ", data);
    });
}


function ecraInicial() {
  $("#conteudo").removeClass("d-none");
  $("#table").addClass("d-none");

  if (books[0].bookId != undefined) {
    exist = true;
    do {
      bookAlreadyExistes(books[i]);

    } while (exist == true);

    if (books[i].link == "No link available" || books[i].link == undefined) {
      $("#Buy1").html(`<b> <font color="darkred"> No link available</font></b>`)
    } else {
      $("#Buy1").html(`<a href="${books[i].link}" target="_blank"><b><font color="cornflowerblue"><u><font-size="16px">Purchase book </u></a></b>`)
    }



      $("#Title1").html("<b>Title: </b>" + books[i].title)
      $("#Img1").html(`<img src="${books[i].img}" alt="book2" width="128px" height="190px">`)
      $("#Description1").html("<b>Description: </b>" + books[i].description)
      truncate(1);
      $("#Button1").html(`<a href="#" id="${i}" onclick="LikeBook('Button1', this.id, true, event)" class="login100-social-item bg4 d-inline-flex">
                              <i class="fa fa-thumbs-o-up"></i>
                            </a>
                            <a href="#" id="${i}" onclick="LikeBook('Button1', this.id, false, event)" class="login100-social-item bg3 d-inline-flex">
                              <i class="fa fa-thumbs-o-down"></i>
                            </a>`);
    i++;
    NovaLista();
    }

    if (books.length > 0) {
      exist = true;
      do {
        bookAlreadyExistes(books[i]);

      } while (exist == true);

      if (books[i].link == "No link available" || books[i].link == undefined) {
        $("#Buy2").html(`<b> <font color="darkred"> No link available</font></b>`)
      } else {
        $("#Buy2").html(`<a href="${books[i].link}" target="_blank"><b><font color="cornflowerblue"><u><font-size="16px"> Purchase book </u></a></b>`)
      }

        $("#Title2").html("<b>Title: </b>" + books[i].title)
        $("#Img2").html(`<img src="${books[i].img}" alt="book2" width="128px" height="190px">`)
        $("#Description2").html("<b>Description: </b>" + books[i].description)
        truncate(2);
        $("#Button2").html(`<a href="#" id="${i}" onclick="LikeBook('Button2', this.id, true, event)" class="login100-social-item bg4 d-inline-flex">
          <i class="fa fa-thumbs-o-up"></i>
        </a>
        <a href="#" id="${i}" onclick="LikeBook('Button2', this.id, false, event)" class="login100-social-item bg3 d-inline-flex">
          <i class="fa fa-thumbs-o-down"></i>
        </a>`);
      
      i++;
      NovaLista();
    }

    if (books.length > 1) {
      exist = true;
      do {
        bookAlreadyExistes(books[i]);

      } while (exist == true);

      if (books[i].link == "No link available" || books[i].link == undefined) {
        $("#Buy3").html(`<b> <font color="darkred"> No link available</font></b>`)
      } else {
        $("#Buy3").html(`<a href="${books[i].link}" target="_blank"><b><font color="cornflowerblue"><font-size="16px"><u>Purchase book </u></a></b>`)
      }


        $("#Title3").html("<b>Title: </b>" + books[i].title)
        $("#Img3").html(`<img src="${books[i].img}" alt="book" width="128px" height="190px">`)
        $("#Description3").html("<b>Description: </b>" + books[i].description)
        truncate(3);
        $("#Button3").html(`<a href="#" id="${i}" onclick="LikeBook('Button3', this.id, true, event)" class="login100-social-item bg4 d-inline-flex">
          <i class="fa fa-thumbs-o-up"></i>
        </a>
        <a href="#" id="${i}" onclick="LikeBook('Button3', this.id, false, event)" class="login100-social-item bg3 d-inline-flex">
          <i class="fa fa-thumbs-o-down"></i>
        </a>`);
      
      i++;
      NovaLista();
    }



}

function LikeBook(select, index, liked, e) {

  books[index].like = liked;
  BooksAGuardar.push(books[index]);
  // BooksAGuardar[index].like = liked;
  postApiLike(BooksAGuardar[BooksAGuardar.length - 1]);
  console.log("BooksAguardar before: ", BooksAGuardar);
  if (liked == true) {
    $('.selectAnimation').val('fadeOutLeft');
  } else {
    $('.selectAnimation').val('fadeOutRight');
  }
  animation(e);

  setTimeout(() => {
    switch (select) {
      case 'Button1':
        NovaLista();

        if (books[i].link == "No link available" || books[i].link == undefined) {
          $("#Buy1").html(`<b> <font color="darkred"> No link available</font></b>`)
        } else {
          $("#Buy1").html(`<a href="${books[i].link}" target="_blank"><b><font color="cornflowerblue"><font-size="16px">Purchase book </a></b>`)
        }
        $("#Title1").html("<b>Title: </b>" + books[i].title)
        $("#Img1").html(`<img src="${books[i].img}" alt="book2" width="128px" height="190px">`)
        $("#Description1").html("<b>Description: </b>" + books[i].description)
        $("#Button1").html(`<a href="#" id="${i}" onclick="LikeBook('Button1', this.id, true, event)" class="login100-social-item bg4 d-inline-flex">
                                <i class="fa fa-thumbs-o-up"></i>
                              </a>
                              <a href="#" id="${i}" onclick="LikeBook('Button1', this.id, false, event)" class="login100-social-item bg3 d-inline-flex">
                                <i class="fa fa-thumbs-o-down"></i>
                              </a>`);
        truncate(1);
        i++;
        break;

      case 'Button2':
        NovaLista();

        if (books[i].link == "No link available" || books[i].link == undefined) {
          $("#Buy2").html(`<b> <font color="darkred"> No link available</font></b>`)
        } else {
          $("#Buy2").html(`<a href="${books[i].link}" target="_blank"><b><font color="cornflowerblue"><font-size="16px">Purchase book </a></b>`)
        }
        $("#Title2").html("<b>Title: </b>" + books[i].title)
        $("#Img2").html(`<img src="${books[i].img}" alt="book2" width="128px" height="190px">`)
        $("#Description2").html("<b>Description: </b>" + books[i].description)
        $("#Button2").html(`<a href="#" id="${i}" onclick="LikeBook('Button2', this.id, true, event)" class="login100-social-item bg4 d-inline-flex">
                                <i class="fa fa-thumbs-o-up"></i>
                              </a>
                              <a href="#" id="${i}" onclick="LikeBook('Button2', this.id, false, event)" class="login100-social-item bg3 d-inline-flex">
                                <i class="fa fa-thumbs-o-down"></i>
                              </a>`);
        truncate(2);
        i++;
        break;

      case 'Button3':
        NovaLista();

        if (books[i].link == "No link available" || books[i].link == undefined) {
          $("#Buy3").html(`<b> <font color="darkred"> No link available</font></b>`)
        } else {
          $("#Buy3").html(`<a href="${books[i].link}" target="_blank"><b><font color="cornflowerblue"><font-size="16px">Purchase book </a></b>`)
        }
        $("#Title3").html("<b>Title: </b>" + books[i].title)
        $("#Img3").html(`<img src="${books[i].img}" alt="book2" width="128px" height="190px">`)
        $("#Description3").html("<b>Description: </b>" + books[i].description)
        $("#Button3").html(`<a href="#" id="${i}" onclick="LikeBook('Button3', this.id, true, event)" class="login100-social-item bg4 d-inline-flex">
                                <i class="fa fa-thumbs-o-up"></i>
                              </a>
                              <a href="#" id="${i}" onclick="LikeBook('Button3', this.id, false, event)" class="login100-social-item bg3 d-inline-flex">
                                <i class="fa fa-thumbs-o-down"></i>
                              </a>`);
        truncate(3);
        i++;
        break;

      default:
        break;
    }
  }, 600);

}


function postApiLike(all) {
  $.ajax({
    type: "POST",
    data: all,
    url: `https://upacademytinder.herokuapp.com/api/users/` + currentUser.id + `/books`,

    success: function (data, status, xhr) {
      console.log('Success!');
    },
    error: function (xhr, status, error) {
      alert('Update Error occurred - ' + error);
    }
  });
}


function truncate(number) {
  var showChar = 250;
  var ellipsestext = "(...)";

  $(`#Description${number}`).each(function () {
    var content = $(this).html();
    if (content.length > showChar) {
      var c = content.substr(0, showChar);
      var h = content;
      var html =
        '<div class="truncate-text" style="display:block">' +
        c +
        '<span class="moreellipses">' +
        ellipsestext +
        `&nbsp;&nbsp;<a href="" class="moreless${number} more">read more</a></span></span></div><div class="truncate-text" style="display:none">` +
        h +
        `&nbsp;&nbsp;<a href="" class="moreless${number} less">show less</a></span></div>`;

      $(this).html(html);
    }
  });

  $(`.moreless${number}`).click(function () {
    var thisEl = $(this);
    var cT = thisEl.closest(".truncate-text");
    var tX = ".truncate-text";

    if (thisEl.hasClass("less")) {
      cT.prev(tX).toggle();
      cT.slideToggle();
    } else {
      cT.toggle();
      cT.next(tX).fadeToggle();
    }
    return false;
  });
}

function animation(e) {
  var object = $('#obj');
  var object2 = $('#conteudo');
  var select = $('.selectAnimation');
  var button = $('#animate');
  var options = $('#anims option');
  var valueChange = $('.changeOpt');

  const ANIM_END = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

  currentAnimationActive = null;

  e.preventDefault();
  listValue = select.val();



  object2.addClass(listValue).one(ANIM_END, function () {
    setTimeout(function () {
      object2.removeClass(listValue);
    }, 500);
  });

  object.addClass(listValue).one(ANIM_END, function () {
    setTimeout(function () {
      object.removeClass(listValue);
    }, 500);
  });
}

function NovaLista() {
  if ((i + 1) % 10 == 0) {
    i++;
    getData();
    i--;
  }
}

function table(var_liked) {

  $("#table").removeClass("d-none");
  $("#conteudo").addClass("d-none");
  $("#accordionExample").addClass("d-none");
  $("#tBody").html("");



  $.get('https://upacademytinder.herokuapp.com/api/users/' + currentUser.id + '/books')
    .done(function (data) {
      tableData = data;
      console.log("Get User Books [tableData]: ", data);

      if (var_liked == true)
        PrintTable(true);
      if (var_liked == false) {
        PrintTable(false);
      }
    });
}


function deleteFromTable(i, like) {
  $.ajax({
    url: `https://upacademytinder.herokuapp.com/api/users/` + currentUser.id + `/books/` + tableData[i].id,
    type: 'DELETE',
    success: () => {
      console.log("Deleted");
    }
  });
  console.log("log i deleted: ", i);

  tableData.splice(i, 1);
  PrintTable(like);
}

function changeLike(i, like) {
  // deleteFromTable(i,like);
  let changedLike = {};

  if (like == true) {
    changedLike = { like: "false" };
    tableData[i].like = "false";
    // BooksAGuardar[i].like = "false";
  } else {
    changedLike = { like: "true" };
    tableData[i].like = "true";
    // BooksAGuardar[i].like = "true";
  }
  PrintTable(like);


  $.ajax({
    url: 'https://upacademytinder.herokuapp.com/api/users/' + currentUser.id + `/books/` + tableData[i].id,
    type: 'PUT',
    data: changedLike,
    success: (x) => {
      console.log("Updated book in user's profile", x);
      console.log("tableData[i].id: ", tableData);

    }
  });
}

function PrintTable(liked) {
  $("#tBody").html("");

  for (let i = 0; i < tableData.length; i++) {
    if (liked == true) {
      if (tableData[i].like == "true") {
        $("#tBody").append(`
            <tr>
              <td scope="row"> <a href="#" class="login100-social-item bg3" id= "${i}" onclick="deleteFromTable(this.id,true)">
							                    <i class="fa fa-trash-o"></i>								
						                    </a>
              <td> <img src="${tableData[i].img}" alt="Imagem não disponível" width="128px" height="190px"</td>
              <td> ${tableData[i].title}</td>
              <td> ${tableData[i].description}</td>
              <td>
                  <a href="#" class="login100-social-item bg3" id= "${i}" onclick="changeLike(this.id,true)">
                    <i class="fas fa-heart-broken"  width="48px" height="48px"></i>
                  </a> 
              </td>
            </tr>
            `);
      }
    }
    if (liked == false) {
      if (tableData[i].like == "false") {

        $("#tBody").append(`
            <tr>
            <td scope="row"><a href="#" class="login100-social-item bg3" id= "${i}" onclick="deleteFromTable(this.id,false)">
                              <i class="fa fa-trash-o"></i>								
                            </a>
              <td> <img src="${tableData[i].img}" alt="Imagem não disponível" width="128px" height="190px"</td>
              <td> ${tableData[i].title}</td>
              <td> ${tableData[i].description}</td>
              <td>
                <a href="#" class="login100-social-item bg4" id="${i}" onclick="changeLike(this.id,false)" >
                  <i class="fa fa-heart"  width="48px" height="48px"></i>
                </a>
              </td> 
            </tr>
            `);
      }
    }
  }

  var rows = document.getElementsByTagName("tbody");
  if (rows.tBody.rows.length == 0) {
    $(".notFound").removeClass("d-none");
    $("#main").addClass("d-none");
  } else {
    $(".notFound").addClass("d-none");
    // $(".bg-image").removeClass("d-none");
  }
}

function bookAlreadyExistes(book) {
  exist = false;
  console.log("tableData On booksAlreadyexist? :", tableData);
  // console.log("booksOnuser: ",booksOnUser.books);

  for (let index = 0; index < tableData.length; index++) {
    if (tableData[index].bookId == book.bookId) {
      exist = true;
      i++;
      NovaLista();

    }
  }
}




