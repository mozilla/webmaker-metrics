
/**
 * PERSONA
 */

var login = document.querySelector("#login");
if (login) {
  login.addEventListener("click", function () {
    navigator.id.request({
      siteName: "Webmaker Metrics"
    });
  }, false);
}

var logout = document.querySelector("#logout");
if (logout) {
  logout.addEventListener("click", function () {
    navigator.id.logout();
  }, false);
}

var token = $("meta[name='csrf-token']").attr("content");
var currentUser = $("meta[name='persona-email']").attr("content");
if (!currentUser) {
  currentUser = null; // specifically set to null to avoid persona looping on logout
}

navigator.id.watch({
  loggedInUser: currentUser,
  onlogin: function (assertion) {
    $.ajax({
      type: 'POST',
      url: '/persona/verify',
      data: {
        assertion: assertion,
        _csrf: token
      },
      success: function (res, status, xhr) {
        if (res.status === 'okay') {
          window.location.reload();
        } else {
          window.alert(res.reason);
        }
      },
      error: function (xhr, status, err) {
        navigator.id.logout();
        window.alert("Login failure: " + err);
      }
    });
  },
  onlogout: function () {
    $.ajax({
      type: 'POST',
      url: '/persona/logout',
      data: {
        _csrf: token
      },
      success: function (res, status, xhr) {
        window.location.reload();
      },
      error: function (xhr, status, err) {
        window.alert("Logout failure: " + err);
      }
    });
  }
});

