document.getElementById('eventForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById('email').value;

    // Envie o e-mail para o servidor usando fetch
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao cadastrar o e-mail.');
        }
        return response.json();
    })
    .then(data => {
        alert('E-mail cadastrado com sucesso! Uma confirmação foi enviada para o seu e-mail.');
        console.log(data);
    })
    .catch(error => {
        alert('Erro ao cadastrar o e-mail. Tente novamente.');
        console.error('Erro:', error);
    });
});
