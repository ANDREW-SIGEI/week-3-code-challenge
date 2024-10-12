document.addEventListener('DOMContentLoaded', () => {
    let currentMovie = null;  // Keep track of the current movie object
  
    // Fetch and display the first movie details when the page loads
    fetch('http://localhost:3000/films/1')
      .then(response => response.json())
      .then(movie => {
        currentMovie = movie;  // Store the current movie object
        displayMovieDetails(movie);
      });
  
    // Fetch and display the list of all movies
    fetchMovies();
  
    // Buy ticket functionality
    document.getElementById('buy-ticket').addEventListener('click', () => {
      if (currentMovie) {
        const availableTicketsElem = document.getElementById('available-tickets');
        let availableTickets = currentMovie.capacity - currentMovie.tickets_sold;
  
        if (availableTickets > 0) {
          availableTickets--;  // Reduce ticket count by 1
          currentMovie.tickets_sold++;  // Increment tickets sold on the movie object
  
          // Update the DOM
          availableTicketsElem.textContent = `Available Tickets: ${availableTickets}`;
  
          // Update tickets_sold on the server (PATCH request)
          fetch(`http://localhost:3000/films/${currentMovie.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tickets_sold: currentMovie.tickets_sold  // Persist the new tickets_sold count
            })
          }).then(response => response.json())
            .then(updatedMovie => {
              currentMovie = updatedMovie;  // Update the current movie with the server response
            });
  
          // Optionally, post a new ticket sale to the tickets endpoint (POST request)
          postNewTicketSale(currentMovie.id, 1);
        } else {
          document.getElementById('buy-ticket').textContent = 'Sold Out';
          document.getElementById('buy-ticket').disabled = true;
        }
      }
    });
  });
  
  // Function to fetch and display all movies in the list
  function fetchMovies() {
    fetch('http://localhost:3000/films')
      .then(response => response.json())
      .then(movies => {
        const filmList = document.getElementById('films');
        filmList.innerHTML = '';  // Clear any existing content
        movies.forEach(movie => {
          const li = document.createElement('li');
          li.textContent = movie.title;
          li.classList.add('film', 'item');
          
          // Add delete button to each movie item
          addDeleteButtonToMovieListItem(movie, li);
  
          // Add event listener to display movie details when clicked
          li.addEventListener('click', () => {
            displayMovieDetails(movie);  // Show movie details when clicked
          });
          filmList.appendChild(li);
        });
      });
  }
  
  // Function to display the movie details
  function displayMovieDetails(movie) {
    // Store the current movie globally
    currentMovie = movie;
  
    // Calculate available tickets
    const availableTickets = movie.capacity - movie.tickets_sold;
  
    // Update the DOM with movie details
    document.getElementById('poster').src = movie.poster;
    document.getElementById('title').textContent = movie.title;
    document.getElementById('runtime').textContent = `Runtime: ${movie.runtime} mins`;
    document.getElementById('showtime').textContent = `Showtime: ${movie.showtime}`;
    const availableTicketsElem = document.getElementById('available-tickets');
    availableTicketsElem.textContent = `Available Tickets: ${availableTickets}`;
  
    // Handle sold-out condition
    handleSoldOut(availableTickets);
  }
  
  // Handle sold out condition
  function handleSoldOut(availableTickets) {
    const buyButton = document.getElementById('buy-ticket');
    if (availableTickets === 0) {
      buyButton.textContent = 'Sold Out';
      buyButton.disabled = true;
    } else {
      buyButton.textContent = 'Buy Ticket';
      buyButton.disabled = false;
    }
  }
  
  // Function to add a delete button to each movie list item
  function addDeleteButtonToMovieListItem(movie, li) {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      fetch(`http://localhost:3000/films/${movie.id}`, {
        method: 'DELETE'
      }).then(() => {
        li.remove();  // Remove the movie from the list
      });
    });
    li.appendChild(deleteBtn);
  }
  
  // Function to post new ticket sales (POST request to /tickets)
  function postNewTicketSale(movieId, numberOfTickets) {
    fetch('http://localhost:3000/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        film_id: movieId,
        number_of_tickets: numberOfTickets
      })
    }).then(response => response.json())
      .then(ticket => {
        console.log('New ticket sale logged:', ticket);
      });
  }
  