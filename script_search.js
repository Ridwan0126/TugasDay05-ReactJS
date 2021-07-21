//Penampung

let User = [];
let UserData = [];
let AlbumData = [];
let PhotoData = [];

// Bagian UNtuk Maengambil Data Dari JsonPlace Holder
const getUsers = () => {
  fetch("https://jsonplaceholder.typicode.com/users")
    .then((response) => response.json())
    .then((json) => {
      UserData = json.map((users) => {
        return {
          userId: users.id,
          userName: users.name,
        };
      });
    });

  fetch("https://jsonplaceholder.typicode.com/albums")
    .then((response) => response.json())
    .then((json) => {
      AlbumData = json.map((albums) => {
        return {
          albumId: albums.id,
          albumName: albums.title,
          userId: albums.userId,
        };
      });
    });

  fetch("https://jsonplaceholder.typicode.com/photos")
    .then((response) => response.json())
    .then((json) => {
      PhotoData = json.map((photos) => {
        return {
          albumId: photos.albumId,
          title: photos.title,
          url: photos.url,
          thumbnailUrl: photos.thumbnailUrl,
        };
      });
    })
    .then(buildData)
    .then(
      setTimeout(
        () => buildTable(pageConfig.currentEntries, pageConfig.currentPage),
        500
      )
    )
    .then(resetSearch);
};

// Bagian Build Data
const buildData = () => {
  for (let i = 0; i < PhotoData.length - 4000; i++) {
    const photoData_ith = PhotoData[i];
    const albumNameById = AlbumData.filter(function (currentElement) {
      return currentElement.albumId === photoData_ith.albumId;
    });

    const userNameById = UserData.filter(function (currentElement) {
      return currentElement.userId === albumNameById[0].userId;
    });
    User.push({
      photoName: photoData_ith.title,
      albumName: albumNameById[0].albumName,
      user: userNameById[0].userName,
      url: photoData_ith.url,
      thumbnail: photoData_ith.thumbnailUrl,
    });
  }
};

// Setting Data dan Tampilan
let option = document.querySelector(".entrie");
let entries = parseInt(option.value);
let table = document.querySelector(".tabel");
let pageTotal = Math.ceil(User.length / entries);
let filteredUsers = [];
let updateStatus = false;
let pageConfig = {
  currentEntries: entries,
  currentPage: 1,
};

//Build Table
const buildTable = (entries, current, data = User) => {
  let countRow = 0;
  let startIndex = entries * (current - 1);
  let endIndex = entries + entries * (current - 1);
  let rows = "";
  let HeaderRow = `
  <table>
  <div class="row">
    <div class="cell header">No / ID</div>
    <div class="cell header">Name User</div>
    <div class="cell header">Album Name</div>
    <div class="cell header">Photo Name</div>
    <div class="cell header">Thumbnail</div>
  </div>
  </table>
  `;
  for (let i = startIndex; i < endIndex; i++) {
    if (i < data.length) {
      const photos = data[i];

      if (countRow == 0) {
        table.innerHTML = HeaderRow;
      }

      rows += `
      <table>
          <div class="row">
             <div class="cell num">${i + 1}</div>
             <div class="cell">${photos.user}</div>
             <div class="cell">${photos.albumName}</div>
             <div class="cell">${photos.photoName}</div>
             <div class="cell">
                <img class="myImg" align-items="center" src="${
                  photos.thumbnail
                }" onClick="imgPop('${photos.url}')"></a>
             </div>
          </div>
          </table>
          `;
      countRow++;
    }
  }
  table.innerHTML += rows;
  buildPagination(entries, current, data);
  if (data.length == 0) {
    table.innerHTML = HeaderRow;
  }
};

//Bagian Paginations
const buildPagination = (entries, currentPage, data = User) => {
  let pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  if (currentPage != 1) {
    pagination.innerHTML = `
    <a href="#" onclick="Choose('prev')" class="prev">Prev</a>
    `;
  }

  let pageTotal = Math.ceil(data.length / entries);
  let showPagination = 3;
  let diff = showPagination - 1;
  let halfLengthPage = Math.floor(showPagination / 2);
  console.log("TOTAL", pageTotal);

  if (diff >= pageTotal) {
    showPagination = pageTotal;
    diff = showPagination - 1;
    halfLengthPage = Math.floor(showPagination / 2);
  }

  let startIndex = currentPage - halfLengthPage;
  if (startIndex < 1) {
    startIndex = 1;
  }

  let endIndex = startIndex + diff;
  if (endIndex > pageTotal) {
    endIndex = pageTotal;
  }

  let currentDiff = endIndex - startIndex;
  console.log("currentDIF", currentDiff);
  console.log("DIFF", diff);
  if (currentDiff < diff) {
    let correction = diff - currentDiff;
    startIndex = currentPage - halfLengthPage - correction;
  }

  console.log("selish", endIndex - startIndex);
  console.log("current", currentPage);
  console.log("startpag", startIndex);
  console.log("endpag", endIndex);

  let buttonPagination = "";

  for (let i = startIndex - 1; i < endIndex; i++) {
    if (i == currentPage - 1) {
      buttonPagination += `
      <a href="#" onclick="Choose('${i + 1}')" class="page${i + 1} active">${
        i + 1
      }</a>
    `;
    } else {
      buttonPagination += `
      <a href="#" onclick="Choose('${i + 1}')" class="page${i + 1}">${i + 1}</a>
      `;
    }
  }
  pagination.innerHTML += buttonPagination;

  if (currentPage != pageTotal && pageTotal != 0) {
    pagination.innerHTML += `
    <a href="#" onclick="Choose('next')" class="next">Next</a>
    `;
  }
};

option.addEventListener("change", function () {
  pageConfig.currentEntries = parseInt(this.value);
  pageConfig.currentPage = 1;
  buildTable(pageConfig.currentEntries, pageConfig.currentPage);
});

// Search Data
let colomnSize = 4;
const Search = () => {
  filteredUsers = [];
  let input = document.querySelector(".search .input").value;
  let filter, table, tr, td, i, txtValue;
  filter = input.toUpperCase();
  table = document.querySelector(".tabel");
  tr = table.querySelectorAll(".row");
  for (i = 0; i < User.length; i++) {
    const userData = User[i];
    td = [userData.user, userData.albumName, userData.photoName];

    let found = 0;
    for (j = 0; j < td.length; j++) {
      if (td[j]) {
        txtValue = td[j];
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          found++;
        } else {
          // tr[i].style.display = "none";
        }
      }
    }

    if (found > 0) {
      filteredUsers.push(userData);
      // tr[i].style.display = "";
    } else {
      // tr[i].style.display = "none";
    }
  }

  buildTable(pageConfig.currentEntries, pageConfig.currentPage, filteredUsers);
};

// Bagian Prev Dan Next
const Choose = (input) => {
  let number = pageConfig.currentPage;
  let buttonPage = parseInt(input);

  let beforePage = document.querySelector(".page" + number);
  let currentPage = "";
  if (buttonPage != NaN) {
    currentPage = document.querySelector(".page" + buttonPage);
  }

  let pageTotal = Math.ceil(User.length / pageConfig.currentEntries);

  if (input == "prev") {
    beforePage.classList.remove("active");
    number--;
    if (number == 0) {
      number = 1;
    }
    let currentPage = document.querySelector(".page" + number);
    currentPage.classList.add("active");
    pageConfig.currentPage = number;
    buildTable(pageConfig.currentEntries, number);
  } else if (input == "next") {
    beforePage.classList.remove("active");
    number++;
    if (number > pageTotal) {
      number = pageTotal;
    }
    let currentPage = document.querySelector(".page" + number);
    currentPage.classList.add("active");
    pageConfig.currentPage = number;
    buildTable(pageConfig.currentEntries, number);
  } else {
    if (buttonPage != number) {
      currentPage.classList.add("active");
      pageConfig.currentPage = buttonPage;
      beforePage.classList.remove("active");
      buildTable(pageConfig.currentEntries, pageConfig.currentPage);
    }
  }
};

// Bagian PopUp Gambar
var modal = document.getElementById("PopUp");
var img = document.querySelector(".myImg");
var modalImg = document.getElementById("image");
var captionText = document.getElementById("cap");

const imgPop = (url) => {
  modal.style.display = "block";
  modalImg.src = url;
};

var span = document.getElementsByClassName("close")[0];

span.onclick = function () {
  modal.style.display = "none";
};

//Search
const resetSearch = () => {
  document.querySelector(".search .input").value = "";
};

const __init = () => {
  getUsers();
};

__init();
