// 'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jack Willson',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-03-08T17:01:17.194Z',
    '2021-03-08T23:36:17.929Z',
    '2021-03-05T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
let account3 = {};
// new Object
const Person = function (
  key,
  owner,
  pin,
  username,
  movements,
  interestRate,
  movementsDates,
  currency,
  locale,
  determiner
) {
  this.key = key;
  this.owner = owner;
  this.pin = pin;
  this.username = username;
  this.movements = movements;
  this.interestRate = interestRate;
  this.movementsDates = movementsDates;
  this.currency = currency;
  this.locale = locale;
  this.determiner = determiner;
};

let accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome'),
  labelDate = document.querySelector('.date'),
  labelBalance = document.querySelector('.balance__value'),
  labelSumIn = document.querySelector('.summary__value--in'),
  labelSumOut = document.querySelector('.summary__value--out'),
  labelSumInterest = document.querySelector('.summary__value--interest'),
  labelTimer = document.querySelector('.timer'),
  labelHighestValue = document.querySelector('.highest__value'),
  labelLeastValue = document.querySelector('.least__value');

const containerApp = document.querySelector('.app'),
  containerMovements = document.querySelector('.movements'),
  movementsRow = document.querySelector('.movements__row');

const btnLogin = document.querySelector('.login__btn'),
  btnTransfer = document.querySelector('.form__btn--transfer'),
  btnLoan = document.querySelector('.form__btn--loan'),
  btnClose = document.querySelector('.form__btn--close'),
  btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user'),
  inputLoginPin = document.querySelector('.login__input--pin'),
  inputTransferTo = document.querySelector('.form__input--to'),
  inputTransferAmount = document.querySelector('.form__input--amount'),
  inputLoanAmount = document.querySelector('.form__input--loan-amount'),
  inputCloseUsername = document.querySelector('.form__input--user'),
  inputClosePin = document.querySelector('.form__input--pin');

// sign up
const signupBtn = document.querySelector('.createAccount'),
  userName = document.querySelector('.username'),
  userPass = document.querySelector('.userpass'),
  confirmPasss = document.querySelector('.passconfirm'),
  modal = document.querySelector('.modal'),
  loginUserInfo = document.querySelector('.login_username');

/////////////////////////////////////////////////
// Functions
// ------- Display Transfer Dates -------
const displayMovementsDate = function (locale, date) {
  // Calculate the days passed
  const calcDaysPass = (date1, date2) => {
    // this will return the days, 1,4, 50 .....
    return Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  };
  // calculate the current date with user's date
  const daysPassed = calcDaysPass(new Date(), date);
  // Display date according to returned days
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} Days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
// ------------ Currency formatting function --------------
const formatCurrency = function (val, locale, currency) {
  const numOptions = {
    style: 'currency',
    currency: currency,
  };
  return new Intl.NumberFormat(locale, numOptions).format(val);
};
//  ------------   Display transfer movements in the DOM   -------------
const displayMovements = (acc, sort = false) => {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // Format date
    const date = new Date(acc.movementsDates[i]);
    const displayDate = displayMovementsDate(acc.locale, date);
    // Format number
    const formatNum = formatCurrency(mov, acc.locale, acc.currency);
    // Movements template
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatNum}</div>
        <button class="movements__delete">Remove</button>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
    // delete transfer
    const deleteButton = document.querySelector('.movements__delete');
    deleteButton.addEventListener('click', () => {
      movs.splice(i, 1);
      // highest deposit
      mostDeposit(currentAccount);
      // highest widthdrawal
      mostWithdraw(currentAccount);
      // update UI
      updateUI(currentAccount);
    });
  });
};
// ---------------- Calculate the user's balance ---------------
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};
// ----------------- Calculate user's summary - INCOME, WITHDRAWAL, INTEREST RATE -------
const calcDisplaySummary = function (acc) {
  // income
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  // withdrawals
  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locale,
    acc.currency
  );
  // interest rate
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

// --------------- Create user name --------------
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
    // returns Ali Haidari ---> ah
  });
};
createUsernames(accounts);
// username for new account
const loginUsername = newAcc =>
  newAcc
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
// returns Ali Haidari ---> ah

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// -------- Logout timer -------------

const startTimeOut = () => {
  let time = 600;
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;
    // When time runs out or === 0
    if (time === 0) {
      // Stop interval
      clearInterval(logoutTimer);
      // Hide UI
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Login to get started ';
    }
    // decrease time by one sec
    time = time - 1;
  };
  // call timer each sec
  tick();
  const logoutTimer = setInterval(tick, 1000);
  return logoutTimer;
};
///////////////////////////////////////
// get localstorage
const getLocalStorage = key => JSON.parse(localStorage.getItem(key));
// Event handlers
let currentAccount, logoutTimer;
// ---------------- Log in ----------------
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  account3 = getLocalStorage(inputLoginUsername.value);
  accounts.push(account3);
  currentAccount = accounts.find(acc => {
    if (acc) return acc.username === inputLoginUsername.value;
  });
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;
    document.querySelector('.signup__btn').style.display = 'none';
    // Display current date
    const now = new Date();
    // Options for displaying date
    const dateOptins = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'short',
    };
    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, dateOptins).format(
      now
    );

    if (logoutTimer) clearInterval(logoutTimer);
    logoutTimer = startTimeOut();

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.focus();
    // Update UI
    updateUI(currentAccount);
    // most deposit
    mostDeposit(currentAccount);
    // most withdraw
    mostWithdraw(currentAccount);
  }
});
// --------------------- Transfer button --------------------
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  account3 = getLocalStorage(inputTransferTo.value);
  accounts = accounts.filter(val => val !== null);
  accounts.push(account3);

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(acc => {
    return acc.username === inputTransferTo.value;
  });
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // transfer
    if (currentAccount.determiner) {
      currentAccount.movements.push(-amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      JSON.stringify(
        // prettier-ignore
        setTolocalStorage(currentAccount.username, currentAccount)
      );
    }
    if (receiverAcc.determiner) {
      receiverAcc.movements.push(amount);
      receiverAcc.movementsDates.push(new Date().toISOString());
      JSON.stringify(
        // prettier-ignore
        setTolocalStorage(receiverAcc.username, receiverAcc)
      );
    } else {
      currentAccount.movements.push(-amount);
      receiverAcc.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());
    }
    // deposit update
    mostDeposit(currentAccount);
    //  withdrawal
    mostWithdraw(currentAccount);
    // reset timer
    clearInterval(logoutTimer);
    logoutTimer = startTimeOut();
    // Update UI
    updateUI(currentAccount);
  }
});
// ------------------- Loan Button ----------------
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputLoanAmount.value;
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);
      // Loan date
      currentAccount.movementsDates.push(new Date().toISOString());
      // reset timer
      clearInterval(logoutTimer);
      logoutTimer = startTimeOut();
      // highest deposit
      mostDeposit(currentAccount);
      // highest withdrawal
      mostWithdraw(currentAccount);
      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

// ----- highest deposit ----
const mostDeposit = function (acc) {
  // get the deposits
  const positiveValues = acc.movements.filter(item => item >= 1);
  let largestDeposit = positiveValues[0];
  // set the highest deposit
  positiveValues.forEach((_, i) => {
    if (positiveValues[i] > largestDeposit) largestDeposit = positiveValues[i];
  });
  // dipslay transfer
  if (positiveValues.length >= 1) {
    labelHighestValue.textContent = formatCurrency(
      largestDeposit,
      acc.locale,
      acc.currency
    );
  } else
    labelHighestValue.textContent = formatCurrency(0, acc.locale, acc.currency);
};
// ---- highest withdrawal ----
const mostWithdraw = function (acc) {
  // get the widthdraws
  const negativeValues = acc.movements.filter(item => item < 0);
  let largestWithdraw = negativeValues[0];
  // set the highest withdrawal
  negativeValues.forEach((_, i) => {
    if (negativeValues[i] < largestWithdraw)
      largestWithdraw = negativeValues[i];
  });
  // diplay transfer
  if (negativeValues.length >= 1) {
    labelLeastValue.textContent = formatCurrency(
      largestWithdraw,
      acc.locale,
      acc.currency
    );
  } else
    labelLeastValue.textContent = formatCurrency(0, acc.locale, acc.currency);
};

// ------------------ Close Account -------------------------
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  function deleteAccount() {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // Delete account
    accounts.splice(index, 1);
    // Hide UI
    containerApp.style.opacity = 0;
  }
  if (
    inputCloseUsername.value === currentAccount.username &&
    !currentAccount.determiner &&
    +inputClosePin.value === currentAccount.pin
  ) {
    deleteAccount();
  }
  // localstorage clear
  if (
    inputCloseUsername.value === currentAccount.username &&
    currentAccount.determiner &&
    +inputClosePin.value === currentAccount.pin
  ) {
    deleteAccount();
    localStorage.removeItem(currentAccount.username);
    location.reload();
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// ---------- sign up -----------
// random movements-array
const randomArray = (length, max) =>
  [...new Array(length)].map(() => Math.round(Math.random() * max));
// random interest-rate
const randomInterestRate = () => (Math.random() * 1.5).toFixed(2);
// random date
const randomDate = length =>
  [...new Array(length)].map(() => new Date(Date.now()).toISOString());

const setTolocalStorage = (name, pass) =>
  localStorage.setItem(name, JSON.stringify(pass));

const signUp = () => {
  if (userName.value !== '' && +userPass.value === +confirmPasss.value) {
    // create new object
    const newUser = new Person(
      userName.value,
      userName.value,
      +userPass.value,
      loginUsername(userName.value),
      randomArray(5, 1000),
      +randomInterestRate(),
      randomDate(5),
      'USD',
      'en-us',
      'ls-account'
    );
    // prettier-ignore
    const {
        key,owner, pin,username, movements,interestRate,movementsDates,currency,locale,determiner} = newUser;
    const prevUser = getLocalStorage(loginUsername(userName.value));
    if (
      prevUser !== null &&
      prevUser.username === loginUsername(userName.value)
    ) {
      alert('Please choose another user name ;)');
      return;
    }
    if (userName.value.indexOf(' ') === -1) {
      alert('Last name is required');
      return;
    }
    // set to localstorage
    if (
      +userPass.value.length >= 3 <= 8 &&
      userName.value.indexOf(' ') !== -1
    ) {
      JSON.stringify(
        // prettier-ignore
        setTolocalStorage(loginUsername(key), {owner,pin,username,movements,interestRate,movementsDates,currency,locale,determiner,})
      );
      account3 = getLocalStorage(loginUsername(userName.value));
      accounts.push(account3);
      userName.value = userPass.value = confirmPasss.value = '';
      // bootstrap 5 modal
      $('#exampleModal').modal('hide');
    } else {
      alert('Password must be between 4 and 8 characters ;)');
    }
  }
};
signupBtn.addEventListener('click', e => signUp());
// ----- Sort transfers -----
let sorted = false;
btnSort.addEventListener('click', function () {
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
