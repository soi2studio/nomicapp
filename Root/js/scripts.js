// Dark Mode
function darkModeToggle() {
    const style = document.getElementById("style1");
    if (style.href.match("./css/styles.css")) {
        style.href = "./css/styles-invert.css";    
    }
    else {
        style.href = "./css/styles.css";  
    }
}

// define variables for dom elements
const calculateButton = document.getElementById("calculate-button");
const resultsElement = document.getElementById("results-element");
const errorElement = document.getElementById("error-element");
const checkbox = document.getElementById("checkbox");
     
// calculate button triggers render function
calculateButton.addEventListener("click", function() { 
    render();
})

function render () {
    // reset innerHTML in case of error //
    resultsElement.innerHTML = `<div></div>`  

    // define variables from user input and selectbox
    const nom = document.getElementById("nom").value / 1; // nom = staked nom
    const sats = document.getElementById("sats").value; // sats = daily sats per nom
    const t = document.getElementById("t").value; // t = number of years
    const r = document.getElementById("r").value / 100; // r = APR % /100 = integer
    const compBoxValue = document.getElementById("c").value; // compound frequency

    // define n and c based on selectbox string
    if(compBoxValue === "Daily") {
        n = 365; // n = number of days compounding ocurs in a year
        c = 1; // c = number of days between compunding
     } else if (compBoxValue === "Weekly") {
        n = 52;
        c = 7;
     } else if (compBoxValue === "Monthly") {
        n = 12;
        c = 30;
     } else { //yearly
        n = 1;
        c = 365;
     }

    // define empty array for calculating average APR with thirdening */
     let rArray = [];

     for (let i = 0; i < t  ; i++) {
     rArray.push( r * (Math.pow( (2/3), [i]))); // thirdening applied to apr - apr reduced by 1/3rd every year
     }

    //console.log(rArray)

    const totalRArray = rArray.reduce((a,b)=>a+b); // total of 'thirdened' aprs
    r3 = totalRArray / t; // average thirdened apr - apr r / no. years t

    //console.log(r3)
 
      if (checkbox.checked == false) {
      //console.log("not checked");
        tr = r; // tr = apr as inout if checkbox not ticked
      } else {
      //console.log("checked");
        tr = r3; // tr = thirdened apr if checkbox ticked 
      }
  
    //console.log(tr) // use tr instead of r to include checkbox


    // A = P (1 + (r/n)) ^ nt  */ // compound interest formula */
    // fvNom = nom * (1+ (r / n)) ^ (n * t) */ //formula adapted for nom/js

    // define empty array for compunding nom */
    let nomArray = [];  

    // create compound array with for loop */
    for (let i = 0; i < n * t; i++) {
        nomArray.push( nom * (Math.pow((1+(tr/n)),[i]))); //create array to show fv nom for each rate of apr applied 
    }
    // console.log(nomArray)

    // calculate results
    const fvNom = parseInt(Math.round((nom * Math.pow((1+ (tr / n)), (n * t)))));  // future value of nom compounded
    const totalSats = c * sats * nomArray.reduce((a,b)=>a+b); // sum of all uncompounded sats in array
    const btc = (totalSats / 100000000); // 100,000,000 sats per btc

    // modify results for display
    const fvNomRound = ((nom * Math.pow((1+ (tr / n)), (n * t)))).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    const commaSats = Math.round(totalSats); // locStr doest work in animation - nan error
    const commaBtc = (btc).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }); // locStr doesn't work in animation - nan error
    const btcValue = (btcPrice * btc).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });


    // generate dom code
    // error messages
    if ( nom == 0 || sats == "" || n == 0 || t == 0 || r == "" ) { //empty fields
      errorElement.innerHTML = `<p>Complete all fields then CALCULATE.</p>`;
      openModal(modal3)
    } else if (r > 2.5){  // unrealistic apr
      errorElement.innerHTML = `<p>APR is already lower than ${r * 100}% and likely to fall over time. Calculator limited to 250% APR.</p>`;
      openModal(modal3)
    } else if (sats > 1){  // unrealistic sats accual rate
      errorElement.innerHTML = `<p>Sats per $NOM per day limited to 1.00. Default value is updated periodically to reflect current rates.</p>`;
      openModal(modal3)
    } else if ( (checkbox.checked == false) && nom > 10000) { //unrealistic nom wallet size
      errorElement.innerHTML = `<p>Max. 10,000 $NOM with the 'Thirdening' box unchecked <input type="checkbox" id="checkbox-i">,</p><p>or 50,000 $NOM with the 'Thirdening' box checked <input type="checkbox" id="checkbox-i" checked>.</p>`;
      openModal(modal3)
    } else if (nom > 50000) {
      errorElement.innerHTML = `<p>Max. 10,000 $NOM with the 'Thirdening' box unchecked <input type="checkbox" id="checkbox-i">,</p><p>or 50,000 $NOM with the 'Thirdening' box checked <input type="checkbox" id="checkbox-i" checked>.</p>`;
      openModal(modal3)
    } else if ((fvNom) > 21000000) {  //if calcs exceed genesis supply of nom
        errorElement.innerHTML = `<p>You would then own more than the entire 21,000,000 genesis supply of Nomic. Try reducing some variables</p>`;
        openModal(modal3)
    } else if ((btc) >= 21000000) { // if max supply btc owned 
        errorElement.innerHTML = `<p>You would then own more than the max supply of Bitcoin. Try reducing some variables.</p>`;
        openModal(modal3)
    // results
    } else {
        resultsElement.innerHTML = `<section class="result-box-container">
                                    <div class="result-box-btc">
                                        <h4 id="sats-result-value">${commaSats}</h4>
                                        <h5>SATS</h5>
                                        <h5>= ${commaBtc} BTC / $${btcValue}</h5>
                                    </div>
                                    <div class="result-box-nom">
                                        <h4 id="nom-result-value">${fvNomRound}</h4>
                                        <h5>$NOM</h5>
                                    </div>`;
    }
// animate SATS result
const srv = document.getElementById("sats-result-value") // from innerHTML

    function animateSats(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
      
        if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.round((progress * (end - start) + start));
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
        window.requestAnimationFrame(step);
    }

animateSats(srv, 0, totalSats, 500);
}

/* BTC Price feed */
/*  define coingecko api url as a variable */
const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1&sparkline=false";
const bitcoinElement = document.getElementById("bitcoin-element");

fetch(apiUrl)
.then((response) => {
  return response.json();
})
.then((data) => {
    let apiData = data;
    let bitcoinObject = apiData.find(x => x.id === 'bitcoin'); // isolate bitcoin object from api
    btcPrice = bitcoinObject["current_price"] // isolate bitcoin price from bicoin object
    bitcoinPrice = (btcPrice).toLocaleString("en-US"); // modify bitcoin price for readability
  
    // console.log(bitcoinObject);
    // console.log(bitcoinPrice);

    bitcoinElement.innerHTML = `<p>$${bitcoinPrice}</p>` // render bitcoin live price in dom
})

.catch(function(error) {
  console.log(error);
});

// set-up modals/info boxes
const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}