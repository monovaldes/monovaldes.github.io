const recordButton = document.getElementById('record-button');
const apiKey = document.getElementById('api-key')
const result = document.getElementById('result')
const recognized = document.getElementById('recognized')
const correctEl = document.getElementById('correct')

let mediaRecorder;
let chunks = [];
A = [
  'armonía', 'agrupación', 'asociación', 'abeja', 'arveja',
  'anteojos', 'antiparras', 'ancla', 'alcaparra', 'aceptar',
  'aceptación', 'ancestro', 'Antropología', 'antropólogo',
  'avion', 'arco', 'arquero', 'arremetida', 'agregar', 'ajedrez',
  'ajenjo', 'acelga', 'apio', 'aceituna', 'agua', 'albahaca',
  'alarma', 'asno', 'arepa', 'asma', 'alcachofa', 'avena', 'alegría',
  'amarillo', 'azul', 'ayer', 'asiento', 'animal', 'artimaña', 'abrir'
].map(word => word.replace(/s$]/g,""));
let respose;

recordButton.addEventListener('click', () => {
  document.getElementById('result').innerText = '';
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordButton.innerText = 'Sending...';
    return;
  }
  
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      recordButton.innerText = 'Stop';
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/mp4' });
      mediaRecorder.start();
      chunks = [];

      // Stop recording after 59 seconds
      setTimeout(() => {
        mediaRecorder.stop();
      }, 60000);
      
      mediaRecorder.addEventListener('dataavailable', e => {
        chunks.push(e.data);
      });
      
      mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('api_key', apiKey.value);
        formData.append('audio', blob, 'recording.webm');

        fetch('https://ejecutivoapi.camiguerra.cl', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if(data.transcription) {
            response = data.transcription.split(' ')
              .map(word => word.toLowerCase())
              .map(word => word.replace(/s$]/g,""));
            uniques = [...new Set(response)]
            correct = uniques.filter(word => A.includes(word));
            console.log(`API Response: ${response}`);
            console.log(`Correct words: ${correct}`);
            // fill the result id with a % of correct words
            result.innerText = `${correct.length / A.length * 100}%`;
            recognized.innerText = `Recognized: ${response}`;
            correctEl.innerText = `Correct: ${correct}`;
          } else{
            result.innerText = 'Unknown Error';
          }

          recordButton.innerText = 'Record';
        })
        .catch(error => {
          console.error('Error:', error);
          recordButton.innerText = 'Record';
        });
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
});

const encodingsDiv = document.getElementById('encodings');

// Check if the 'encodings' div exists
if (encodingsDiv) {
  // Create a list element for supported encodings
  const encodingList = document.createElement('ul');

  // Check each MIME type for support using isTypeSupported()
  const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/aac'];
  mimeTypes.forEach((mimeType) => {
    const isSupported = MediaRecorder.isTypeSupported(mimeType);
    const listItem = document.createElement('li');
    listItem.textContent = `${mimeType}: ${isSupported ? 'Supported' : 'Not Supported'}`;
    encodingList.appendChild(listItem);
  });

  // Append the encodingList to the 'encodings' div
  encodingsDiv.appendChild(encodingList);
}