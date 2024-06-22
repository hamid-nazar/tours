
const bookBtn = document.getElementById('book-tour');

const stripe = Stripe("pk_test_51PUPpQLpYSsZPgY7xd3hdEvKup4T3Vc8b66EmvRO3kkmyMnlIvgCMvob4RTyR0iZ78cSTRmsxvsZCefoYV8BJqIQ00omWzGCxC");


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

async function bookTour( tourId) {

    try {

        const session = await fetch(`http://localhost:8000/api/bookings/checkout-session/${tourId}`);

        const sessionResponse = await session.json();


        await stripe.redirectToCheckout({sessionId: sessionResponse.session.id});

        console.log(sessionResponse.session.id);

    } catch (err) {

        console.log(err);
        showAlert('error', err);
    }

}


if (bookBtn)
    bookBtn.addEventListener('click', function (e) {

      e.target.textContent = 'Processing...';

      const { tourId } = e.target.dataset;

      bookTour(tourId);
    });