// Create a new date instance dynamically with JS
let today = new Date();
let newDate = today.getFullYear() + '-' +(today.getMonth()+1 )+ '-' + today.getDate();
console.log("Date is:", newDate);


// Personal API Key for OpenWeatherMap API
const weatherServerURL = 'https://api.openweathermap.org/data/2.5/weather/?zip=';
const apiKey = '&appID=76aa91139c7537d1992cc3e86268bd28';
const localhostServerURL = 'http://localhost:8888';

// Event listener to add function to existing HTML DOM element
document.getElementById("generate").addEventListener('click', taskToPerform);

/* Function called by event listener */
function taskToPerform(){
  const location =  document.getElementById('zip').value;
  const country =  document.getElementById('country').value;
  const userResponse =  document.getElementById('feelings').value;

  getData(weatherServerURL,location,country,apiKey)
  .then((data) =>{
    console.log("The data is:", data);
    console.log("The temperature is:", data.main.temp)
    console.log("The feelings are:", userResponse)
    console.log("The date is:", newDate)
  
    prepareData(data, userResponse)
    .then((projectData)=>{
      console.log('Data prepared to be sent to server:', projectData)
      postData(localhostServerURL + '/sendData', projectData)
      .then((responseData)=>{
        console.log('Response from server:', responseData)
        if(responseData.status == 200){
          retrieveData(localhostServerURL + '/retreiveData')
          .then((uiData)=>{
            console.log('Data to be displayed in UI:', uiData)
            updateUI(uiData);
          })
        } else{
          // Displaying in UI that there was some error.
          console.log("error in the api call");
        }
   
      })
    })
  });
};

// Function to GET Web API Data (Get Route II)
const getData = async (baseURL,location,country,apiKey)=>{

  const url = weatherServerURL + location + "," + country + apiKey;
  console.log("Calling weather server api with url:", url);

  const res = await fetch(url)
  console.log("Fetch call completed")
    try {
  
      const data = await res.json();
      console.log("Received data from weatherserver", data);
      return data;
    }  catch(error) {
      console.log("error", error);
      // appropriately handle the error
    }
  }

// Function to prepare project data that need to be sent to server
const prepareData = async (data, userResponse) =>{
  try{
    if(data.message){
      // Error case
      console.log('Error response:', data)
      const projectData = data.message;
      console.log('Error case project data:', projectData) 
      return projectData;    
    } else {
      // success case
      console.log('Successful response:', data)
      const projectData = {
        temp: data.main.temp,
        userResponse: userResponse,
        date: newDate
      };
      console.log('Successful case project data:', projectData)
      return projectData;
    }
  }catch(error){
    console.error(error);
  }
}

/* Function to POST data */
const postData = async (url = '', projectData = {}) =>{
  console.log("postData called with url:", url)
  console.log('postData called with projectData:', projectData)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    console.log('postData completed with response:', response.status)
    return response;
  }  catch(error) {
    console.log("error", error);
    // appropriately handle the error
  }
}

/* Function to GET Project Data */
const retrieveData = async(url) =>{
  console.log("retrieveData called with url:", url)
  const data = await fetch(url)
    try {
      const result = await data.json();
      console.log('Data received from server through /retrieveData route:',result);
      return result;
    }  catch(error) {
      console.log("error", error);
      // appropriately handle the error
    }
}

const updateUI = async (uiData) =>{
  const request = await fetch('http://localhost:8888/retreiveData');
  try {
  // Transform into JSON
    const uiData = await request.json()
    console.log('updateUI called with:', uiData)
  // Write updated data to DOM elements
    document.getElementById('date').innerHTML = uiData.date;
    document.getElementById('temperature').innerHTML = uiData.temp;
    document.getElementById('userResponse').innerHTML = uiData.userResponse
  }
  catch(error) {
    console.log("error", error);
    // appropriately handle the error
  }
}