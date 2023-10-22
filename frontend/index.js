const recordButton = document.getElementById('record-button');
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
      mediaRecorder = new MediaRecorder(stream);
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
        formData.append('audio', blob, 'recording.webm');
        
        fetch('http://localhost:3000', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          response = data.transcription.split(' ')
            .map(word => word.toLowerCase())
            .map(word => word.replace(/s$]/g,""));
          uniques = [...new Set(response)]
          correct = uniques.filter(word => A.includes(word));
          console.log(`API Response: ${response}`);
          console.log(`Correct words: ${correct}`);
          // fill the result id with a % of correct words
          document.getElementById('result').innerText = `${correct.length / A.length * 100}%`;
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