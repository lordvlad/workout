function $(s, r){return (r || document).querySelector(s);};
function $$(s, r){return Array.prototype.slice.call((r || document).querySelectorAll(s));};
function empty(n){while (n.firstChild) n.removeChild(n.firstChild);}
function remove(n){n.parentNode.removeChild(n);}

var exercises = {
	"de-DE": {
		squat: "Kniebeuge",
		pushups: "Liegestütze",
		pullups: "Klimmzüge",
		situps: "Rumpfbeuge",
		lunges: "Ausfallschritte",
	}
}

var words = {
	"de-DE": {
		next: "Nächste Übung",
		ready: "Fertig?",
		done: "Stop!",
		go: "Los!",
		one: "Eins",
		two: "Zwei",
		three: "Drei",
		half: "Halbzeit",
		welldone: "Gut gemacht",
		another: "Noch eine Runde?",
		howmany: "Wieviele Wiederholungen hast du geschafft?"
	}
};

function say(l, r, t, wait) {
	var u = new SpeechSynthesisUtterance(t);
	u.lang = l;
	u.rate = r;

	return function(){
		if (!wait)
			return Promise.resolve(speechSynthesis.speak(u));

		 return new Promise(function(resolve, reject){
			 u.onend = resolve;
			 speechSynthesis.speak(u);
		 });
	};
}

function wait(t) {
	return function(){
		return new Promise(function(resolve, reject) {
			setTimeout(resolve, t);
		});
	};
}

function start(workout) {
	var lang = "de-DE";
	var repeats = 1;
	var durations = 60 * 1000;
	var breaks = 10 * 1000;
	var speed = 1.1;
	var s = say.bind(null, lang, speed);

	var w = Object.keys(workout[lang]);
	var l, i = l = w.length;

	var d = ((repeats * l * (durations + breaks)) / 1000) |0;

	if (d < 60) {
	} else if (d < (60*60)) {
		d = (d / 60) |0;
		d = d + " Minuten";
	} else {
		d = (d / (60 * 60));
		d = (d|0) + " Stunden und " + ((d % 60)|0) + " Minuten";
	}

	var p = s("Bereit für dein " + d + " Training?", true)();

	w.forEach(function (e) {
		p = p.then(s(words[lang].next))
			.then(s(workout[lang][e]))
			.then(s(words[lang].ready, true))
			.then(s(words[lang].three))
			.then(wait(1000))
			.then(s(words[lang].two))
			.then(wait(1000))
			.then(s(words[lang].one))
			.then(wait(1000))
			.then(s(words[lang].go))
			.then(wait(durations / 2))
			.then(s(words[lang].half))
			.then(wait(durations / 2))
			.then(s(words[lang].done));

		if (i--)
			p = p.then(wait(breaks - 3000));
	})

	return p.then(s(words[lang].welldone));
}


(function(){

	// set up voices selector
	speechSynthesis.onvoiceschanged = function(){
		var langs = speechSynthesis
				.getVoices()
				.map(function(v){return v.lang})
				.filter(function(l){return l.length});

		var langOpts = ['--choose language--'].concat(langs)
				.map(function(l, o){return o = document.createElement('option'), o.value = o.innerText = l, o;	})
				.reduce(function(d, e){return d.appendChild(e), d;}, document.createDocumentFragment());

		var langSel = $('select[name="lang"]');
		empty(langSel);
		langSel.appendChild(langOpts);

		langSel.onchange = function(){

			// set up workout selector
			var exerciseOpts = Object.keys(exercises['de-DE'])
					.reduce(function(d, e){
						var a = document.createElement('label');
						var b = document.createElement('input');
						var f = document.createElement('div');

						a.innerText = e;
						b.type = 'checkbox';
						b.name = e;
						b.value = e;
						f.classList.add('ui');
						f.classList.add('checkbox');
						f.appendChild(b);
						f.appendChild(a);

						return d.appendChild(f), d;
					}, document.createDocumentFragment());

			$$('[name="workout"] .ui.checkbox').forEach(remove);
			$('[name="workout"]').appendChild(exerciseOpts);
			$$('[name="workout"] .ui.checkbox').forEach(function(n){
				n.onclick = function(e){
					if (e.which !== 1) return;
					n.classList.toggle('checked');
					(x=n.querySelector('input')).checked = !x.checked;
				}
			});
		}

	};


}());
