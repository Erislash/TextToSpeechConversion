(function StartApp(){
    const synth = window.speechSynthesis;
    let controlState = 'none';
    LightButtons(controlState);

    GetVoices(synth).then((data) => {
        const voices = data;
        const {form,
            textInput,
            rateInput,
            rateVal,
            pitchInput,
            pitchVal,
            controlState,
            voicesCont,
            voiceSelectedBtn,
            stopBtn,
            pauseResumeBtn} = GetElements();
        
        PopulateVoices(voicesCont, voices);
        

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            Speach(
                synth,
                textInput.value,
                voiceSelectedBtn,
                voices,
                pitchInput.value,
                rateInput.value,
                pauseResumeBtn,
                controlState);
        });
        pauseResumeBtn.addEventListener('click', function(e){
            e.preventDefault();
            PauseResume.bind(this, synth, controlState)();
        });
        stopBtn.addEventListener('click', function(e){
            e.preventDefault();
            Stop(synth, pauseResumeBtn, controlState);
        });
        
        voiceSelectedBtn.addEventListener('click', ShowVoices);

        textInput.addEventListener('input', (e) => {
            if(e.target.value.length > 0)
                document.querySelector('#textField').classList.add('active');
            else
                document.querySelector('#textField').classList.remove('active');
        });
    });
})();

function ShowVoices(e){
    this.parentElement.classList.toggle('active');

    if(/active/.test(this.parentElement.className))
        this.parentElement.querySelector('i').className = 'fas fa-angle-up';
    else
        this.parentElement.querySelector('i').className = 'fas fa-angle-down';

}

function GetElements(){
    return{
        form :              document.querySelector('#textToSpeachForm'),
        textInput :         document.querySelector('#textToSpeach'),

        rateInput :         document.querySelector('#rate'),
        rateVal :           document.querySelector('#rateVal'),

        pitchInput :        document.querySelector('#pitch'),
        pitchVal :          document.querySelector('#pitchVal'),

        controlBox :        document.querySelector('#controlBox'),

        voiceSelectedBtn:   document.querySelector('#voiceSelectedBtn'),
        voicesCont :        document.querySelector('#voices'),

        stopBtn :           document.querySelector('#stop'),
        pauseResumeBtn :    document.querySelector('#pauseResume')

    }
}

function GetVoices(synth){
    return new Promise((resolve, reject) => {
        let myInterval = setInterval( () => {
            let voices = synth.getVoices();

            if(voices.length != 0){
                resolve(voices);
                clearInterval(myInterval);
            }
        }, 10);
    });
}

function PopulateVoices(container, voices){
    for(let i = 0; i < voices.length; i++){
        const voice = voices[i];

        let option = document.createElement('div');
        option.classList.add('voice');
        option.textContent = `${voice.name} - ${voice.lang}`;

        option.value = voice.name;

        container.appendChild(option);
    }

    document.querySelectorAll('.voice').forEach(voice => {
        voice.addEventListener('click', function(e){
            document.querySelector('#voiceSelectedBtn').dataset.selected = this.value;
            document.querySelector('#voiceSelectedBtn').innerHTML = `<span>${this.value}</span>
            <i class="fas fa-angle-down"></i>`;
        })
    });
}

function Speach(synth,
                text,
                selectedVoice,
                voices,
                pitch,
                rate,
                pauseResumeBtn,
                controlState){
    synth.cancel();
    controlState = 'play';
    LightButtons(controlState);

    pauseResumeBtn.dataset.action = 'pause';
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
    const expression = new SpeechSynthesisUtterance(text);
    const selectedOption = selectedVoice.dataset.selected;

    expression.voice = voices.filter((voice) => voice.name == selectedOption)[0];

    expression.pitch = pitch;
    expression.rate = rate;
    
    synth.speak(expression);

    expression.onend = function(){
        controlState = 'none'
        LightButtons(controlState);
    }

    expression.onstart = function(){
        controlState = 'play'
        LightButtons(controlState);
    }
}


function Stop(synth, pauseResumeBtn, controlState){
    synth.cancel();
    controlState = 'stop';
    LightButtons(controlState);
    pauseResumeBtn.dataset.action = 'pause';
    pauseResumeBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
}

function PauseResume(synth, controlState){
    switch(this.dataset.action){
        case 'pause':
            if(synth.speaking){
                controlState = 'pause';
                LightButtons(controlState);
                this.dataset.action = 'resume';
                this.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
                synth.pause();
            }
            break;
        case 'resume':
            controlState = 'play';
            LightButtons(controlState);
            this.dataset.action = 'pause';
            this.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
            synth.resume();
            break;
    }
}


function LightButtons(controlState){
    pauseResumeBtn = document.getElementById('pauseResume');
    speachBtn = document.getElementById('speach');
    stopBtn = document.getElementById('stop');


    switch(controlState){
        case 'none':
            speachBtn.classList.remove('active');
            pauseResumeBtn.classList.remove('active');
            stopBtn.classList.remove('active');
            break;
        case 'play':
            speachBtn.classList.add('active');
            pauseResumeBtn.classList.remove('active');
            stopBtn.classList.remove('active');
            break;
        case 'pause':
            speachBtn.classList.remove('active');
            pauseResumeBtn.classList.add('active');
            stopBtn.classList.remove('active');
            break;
        case 'stop':
            speachBtn.classList.remove('active');
            pauseResumeBtn.classList.remove('active');
            stopBtn.classList.add('active');
            setTimeout(() => {
                speachBtn.classList.remove('active');
                pauseResumeBtn.classList.remove('active');
                stopBtn.classList.remove('active');
            }, 1000);
            break;
    }
    
}

