function createFeedbackForm() {
    const body = document.body;
    body.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
        background: linear-gradient(45deg, #1a1a1a, #540287);
        margin: 0;
        padding: 0;
        color: #fff;
    `;

    const container = document.createElement('div');
    container.classList.add('container');
    body.appendChild(container);

    const title = document.createElement('h1');
    title.textContent = 'Feedback do Filme';
    container.appendChild(title);

    const description = document.createElement('p');
    description.textContent = 'Compartilhe sua opinião sobre o filme!';
    container.appendChild(description);

    const feedbackCheckboxWrapper = document.createElement('div');
    feedbackCheckboxWrapper.style.display = 'flex';
    feedbackCheckboxWrapper.style.flexDirection = 'column';
    feedbackCheckboxWrapper.style.alignItems = 'flex-start';
    feedbackCheckboxWrapper.style.gap = '10px';
    container.appendChild(feedbackCheckboxWrapper);

    const feedbackCheckbox = document.createElement('input');
    feedbackCheckbox.type = 'checkbox';
    feedbackCheckbox.id = 'feedback-checkbox';
    feedbackCheckbox.name = 'feedback-checkbox';
    feedbackCheckbox.style.marginBottom = '20px';

    const feedbackCheckboxLabel = document.createElement('label');
    feedbackCheckboxLabel.setAttribute('for', 'feedback-checkbox');
    feedbackCheckboxLabel.textContent = 'Marque para enviar seu feedback:';
    feedbackCheckboxWrapper.appendChild(feedbackCheckboxLabel);
    feedbackCheckboxWrapper.appendChild(feedbackCheckbox);

    const form = document.createElement('form');
    form.id = 'feedback-form';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '10px';
    form.style.display = 'none'; 
    feedbackCheckboxWrapper.appendChild(form);

    function createField(labelText, inputType, inputId, placeholder) {
        const fieldWrapper = document.createElement('div');
        fieldWrapper.style.textAlign = 'left';

        const label = document.createElement('label');
        label.setAttribute('for', inputId);
        label.textContent = labelText;
        label.style.fontWeight = 'bold';

        const input = document.createElement(inputType === 'textarea' ? 'textarea' : 'input');
        input.id = inputId;
        input.name = inputId;
        input.placeholder = placeholder;
        input.required = true;
        input.classList.add('feedback-section');
        
        if (inputType === 'number') {
            input.setAttribute('min', '1');
            input.setAttribute('max', '5');
        }
        if (inputType === 'textarea') {
            input.rows = '4';
        }

        fieldWrapper.appendChild(label);
        fieldWrapper.appendChild(input);
        return fieldWrapper;
    }

    form.appendChild(createField('Nome do Filme:', 'text', 'movie-name', 'Digite o nome do filme'));
    form.appendChild(createField('Avaliação (1 a 5 estrelas):', 'number', 'rating', 'Dê sua nota'));
    form.appendChild(createField('Comentário:', 'textarea', 'review', 'Escreva sua opinião'));

    const favoriteWrapper = document.createElement('div');
    favoriteWrapper.style.textAlign = 'left';

    const favoriteLabel = document.createElement('label');
    favoriteLabel.textContent = 'Este filme é um favorito?';
    favoriteLabel.style.fontWeight = 'bold';
    favoriteLabel.style.display = 'flex';
    favoriteLabel.style.alignItems = 'center';
    favoriteLabel.style.gap = '8px';

    const favoriteCheckbox = document.createElement('input');
    favoriteCheckbox.type = 'checkbox';
    favoriteCheckbox.id = 'favorite';
    favoriteCheckbox.name = 'favorite';

    favoriteLabel.appendChild(favoriteCheckbox);
    favoriteWrapper.appendChild(favoriteLabel);
    form.appendChild(favoriteWrapper);

    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.textContent = 'Enviar Feedback';
    submitButton.classList.add('button');
    
    form.appendChild(submitButton);

    const favoriteMoviesSection = document.createElement('div');
    favoriteMoviesSection.classList.add('favorite-movies');
    favoriteMoviesSection.id = 'favorite-movies';
    container.appendChild(favoriteMoviesSection);

    const favoriteMoviesTitle = document.createElement('h3');
    favoriteMoviesTitle.textContent = 'Meus Filmes Favoritos:';
    favoriteMoviesSection.appendChild(favoriteMoviesTitle);

    const favoriteMoviesList = document.createElement('ul');
    favoriteMoviesList.id = 'favorite-list';
    favoriteMoviesSection.appendChild(favoriteMoviesList);

    loadFavoriteMovies();

    feedbackCheckbox.addEventListener('change', function() {
        if (feedbackCheckbox.checked) {
            form.style.display = 'flex'; 
        } else {
            form.style.display = 'none'; 
        }
    });
}

function handleFeedbackFormSubmit(event) {
    event.preventDefault();

    const movieName = document.getElementById('movie-name').value;
    const rating = document.getElementById('rating').value;
    const review = document.getElementById('review').value;
    const isFavorite = document.getElementById('favorite').checked;

    console.log(`Filme: ${movieName}`);
    console.log(`Avaliação: ${rating} estrelas`);
    console.log(`Comentário: ${review}`);
    console.log(`Favorito: ${isFavorite ? 'Sim' : 'Não'}`);

    if (rating > 3 && isFavorite) {
        addToFavorites(movieName);
    }

    alert(`Obrigado pelo feedback! Você avaliou "${movieName}" com ${rating} estrelas.\nComentário: "${review}"`);

    document.getElementById('feedback-form').reset();
}

function addToFavorites(movieName) {
    const favoriteList = document.getElementById('favorite-list');
    const favoriteMoviesSection = document.getElementById('favorite-movies');

    favoriteMoviesSection.style.display = 'block';

    const movieItem = document.createElement('li');
    movieItem.textContent = movieName;
    movieItem.style.cssText = `
        margin: 10px 0;
        font-size: 1em;
    `;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remover';
    removeButton.classList.add('remove-btn');
    removeButton.onclick = () => {
        movieItem.remove();
        if (!favoriteList.hasChildNodes()) {
            favoriteMoviesSection.style.display = 'none';
        }
        saveFavoriteMovies();
    };

    movieItem.appendChild(removeButton);
    favoriteList.appendChild(movieItem);

    saveFavoriteMovies();
}

function saveFavoriteMovies() {
    const favoriteList = document.getElementById('favorite-list');
    const favoriteMovies = [];
    
    favoriteList.querySelectorAll('li').forEach((item) => {
        favoriteMovies.push(item.textContent.replace('Remover', '').trim());
    });

    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
}

function loadFavoriteMovies() {
    const favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
    const favoriteList = document.getElementById('favorite-list');
    const favoriteMoviesSection = document.getElementById('favorite-movies');

    if (favoriteMovies.length > 0) {
        favoriteMoviesSection.style.display = 'block';
    }

    favoriteMovies.forEach((movieName) => {
        const movieItem = document.createElement('li');
        movieItem.textContent = movieName;
        movieItem.style.cssText = `
            margin: 10px 0;
            font-size: 1em;
        `;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remover';
        removeButton.classList.add('remove-btn');
        removeButton.onclick = () => {
            movieItem.remove();
            if (!favoriteList.hasChildNodes()) {
                favoriteMoviesSection.style.display = 'none';
            }
            saveFavoriteMovies();
        };

        movieItem.appendChild(removeButton);
        favoriteList.appendChild(movieItem);
    });
}

function initializePage() {
    createFeedbackForm();
    document.getElementById('feedback-form').addEventListener('submit', handleFeedbackFormSubmit);
}

initializePage();
