/* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');


function hideAlert() {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

// type is 'success' or 'error'
function showAlert (type, msg) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};

async function login (email, password){
  try {
    const res = await fetch('http://localhost:8000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    const data = await res.json();
    console.log(data.message);

    if (res.status === 200) {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else{
      showAlert('error', data.message);
    }
  } catch (err) {
    
    showAlert('error', err.message);
  }
};

if (loginForm) {
  loginForm.addEventListener('submit',async function (e){
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

async function logout () {
  try {
    const res = await fetch('http://localhost:8000/api/users/logout', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log(res);

    if ((res.status === 200)) {
      showAlert('success', 'Logged out successfully!');
      location.reload(true);
    }
    
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};


if(logOutBtn){
  logOutBtn.addEventListener('click', logout);
}


async function updateSettings (data, type){

  try {

    const url = type === 'password'? 'http://localhost:8000/api/users/update-password':'http://localhost:8000/api/users/update-me';

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
      const reponse = await res.json();
      console.log(res);
    if (res.status === 200) {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }else{
      showAlert('error', `${reponse.message}`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};


if (userDataForm){

  userDataForm.addEventListener('submit', async function (e){
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    updateSettings({ name, email }, 'data');
  });
}



  if (userPasswordForm){

    userPasswordForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      document.querySelector('.btn--save-password').textContent = 'Updating...';
  
      const currentPassword = document.getElementById('password-current').value;
      const newPassword = document.getElementById('password').value;
      const newPasswordConfirm = document.getElementById('password-confirm').value;

      
      await updateSettings({ currentPassword, newPassword, newPasswordConfirm }, 'password');
  
      document.querySelector('.btn--save-password').textContent = 'Save password';
      
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }
