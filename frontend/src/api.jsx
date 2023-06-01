const API_BASE_URL = 'http://52.199.147.207';
// const API_BASE_URL = 'http://localhost:3001';

const API_Version = '/api/1.0/';

// Function to make an HTTP GET request
export async function get(endpoint, parms) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_Version}${endpoint}${parms}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data from the API.');
  }
};

export async function authorize_get(endpoint, JWT) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_Version}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${JWT}`
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data from the API.');
  }
};

// Function to make an HTTP POST request
export async function post(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_Version}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data from the API.');
  }
};

// Function to make an HTTP POST request
export async function authorize_post(endpoint, JWT, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_Version}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JWT}`
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data from the API.');
  }
};

// Function to make an HTTP PUT request
export async function put(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_Version}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data from the API.');
  }
};


export async function del(endpoint, JWT, parms){
  try {
    const response = await fetch(`${API_BASE_URL}${API_Version}${endpoint}${parms}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${JWT}`
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch data from the API.');
  }
};
