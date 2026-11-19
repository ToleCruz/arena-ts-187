"use strict";
// ===== Arena TS 187 · Proyecto final de la Actividad 35 =====
// ---------- 2. Clase abstracta: el molde de todos los personajes ----------
class Personaje {
    constructor(nombre, emoji, clase, ataque, // protected: lo usan las clases hijas
    arma) {
        this.nombre = nombre;
        this.emoji = emoji;
        this.clase = clase;
        this.ataque = ataque;
        this.arma = arma;
        this._vida = 100; // private: solo se cambia con el setter
        Personaje.total++;
    }
    // getter y setter: la vida siempre queda entre 0 y 100
    get vida() { return this._vida; }
    set vida(valor) { this._vida = Math.min(100, Math.max(0, valor)); }
    get vivo() { return this._vida > 0; }
    recibirDanio(cantidad) {
        this.vida = this.vida - cantidad;
    }
    atacar(objetivo) {
        const esCritico = Math.random() < 0.25 && this.arma.critico !== undefined;
        const golpe = (this.ataque + this.arma.danio) * (esCritico ? this.arma.critico : 1);
        objetivo.recibirDanio(golpe);
        return `${this.nombre} ataca con ${this.arma.nombre} a ${objetivo.nombre} (-${golpe})${esCritico ? " ¡CRÍTICO!" : ""}`;
    }
    // static: fábrica que crea el personaje correcto según el tipo
    static crear(tipo, nombre) {
        switch (tipo) {
            case "mago": return new Mago(nombre);
            case "arquera": return new Arquera(nombre);
            case "sanadora": return new Sanadora(nombre);
            default: return new Guerrero(nombre);
        }
    }
}
Personaje.total = 0; // static: lo comparte toda la clase
// ---------- 3. Herencia: cada clase hija tiene su estilo ----------
class Guerrero extends Personaje {
    constructor(nombre, escudo = 4) {
        super(nombre, "🛡️", "Guerrero", 10, { nombre: "Espada", danio: 6, critico: 2 });
        this.escudo = escudo;
    }
    recibirDanio(cantidad) {
        super.recibirDanio(Math.max(0, cantidad - this.escudo));
    }
    especial(objetivo) {
        objetivo.recibirDanio(26);
        return `${this.nombre} usa ⚔️ Golpe Titánico contra ${objetivo.nombre} (-26)`;
    }
}
class Mago extends Personaje {
    constructor(nombre) {
        super(nombre, "🧙", "Mago", 8, { nombre: "Varita", danio: 7 });
        this.mana = 30;
    }
    especial(objetivo) {
        if (this.mana < 15)
            return `${this.nombre} intenta un hechizo... ¡sin maná! 💨`;
        this.mana -= 15;
        objetivo.recibirDanio(32);
        return `${this.nombre} lanza 🔥 Bola de Fuego a ${objetivo.nombre} (-32)`;
    }
    atacar(objetivo) {
        this.mana = Math.min(30, this.mana + 5);
        return super.atacar(objetivo) + " (+5 maná)";
    }
}
class Arquera extends Personaje {
    constructor(nombre) {
        super(nombre, "🏹", "Arquera", 9, { nombre: "Arco élfico", danio: 6, critico: 3 });
    }
    especial(objetivo) {
        const primera = this.atacar(objetivo);
        const segunda = this.atacar(objetivo);
        return `🏹 Doble disparo → ${primera} | ${segunda}`;
    }
}
class Sanadora extends Personaje {
    constructor(nombre) {
        super(nombre, "✨", "Sanadora", 8, { nombre: "Báculo", danio: 5, critico: 2 });
    }
    curar(cantidad) {
        this.vida = this.vida + cantidad;
        return `${this.nombre} se cura ✨ +${cantidad} → ${this.vida} ❤`;
    }
    especial(objetivo) {
        objetivo.recibirDanio(12);
        return `${this.nombre} lanza 🌟 Luz sagrada (-12) y ${this.curar(18)}`;
    }
}
// ---------- 4. Elementos de la página ----------
const $ = (id) => document.getElementById(id);
const nombre1 = $("nombre1");
const nombre2 = $("nombre2");
const tipo1 = $("tipo1");
const tipo2 = $("tipo2");
let peleadores = [];
let turno = 0; // 0 = jugador 1, 1 = jugador 2
function pintar() {
    peleadores.forEach((p, i) => {
        const extra = p instanceof Mago ? `<div class="dato">Maná: ${p.mana}</div><div class="barra"><div class="mana" style="width:${p.mana / 30 * 100}%"></div></div>` : "";
        const caja = $("p" + (i + 1));
        caja.className = "peleador" + (i === turno && p.vivo ? " activo" : "") + (!p.vivo ? " derrotado" : "");
        caja.innerHTML = `
      <div class="emoji">${p.emoji}</div>
      <div class="nombre">${p.nombre}</div>
      <div class="clase">${p.clase} · ${p.arma.nombre}</div>
      <div class="dato">Vida: ${p.vida} / 100</div>
      <div class="barra"><div class="vida" style="width:${p.vida}%"></div></div>${extra}`;
    });
    $("turno").textContent = `Turno de ${peleadores[turno].emoji} ${peleadores[turno].nombre}`;
    $("contador").textContent = `Personajes creados: ${Personaje.total}`;
}
function jugar(accion) {
    const atacante = peleadores[turno];
    const rival = peleadores[1 - turno];
    const texto = accion === "atacar" ? atacante.atacar(rival) : atacante.especial(rival);
    console.log(texto);
    if (!rival.vivo) {
        pintar();
        $("turno").textContent = "🏁 Fin de la batalla";
        $("ganador").textContent = `🏆 ¡${atacante.nombre} gana la batalla!`;
        $("ganador").classList.remove("oculto");
        $("btnRevancha").classList.remove("oculto");
        $("btnAtacar").disabled = true;
        $("btnEspecial").disabled = true;
        console.log(`🏆 Ganador: ${atacante.nombre} (${atacante.clase}) con ${atacante.vida} de vida`);
        return;
    }
    turno = 1 - turno;
    pintar();
}
$("btnPelear").addEventListener("click", () => {
    peleadores = [
        Personaje.crear(tipo1.value, nombre1.value.trim() || "Jugador 1"),
        Personaje.crear(tipo2.value, nombre2.value.trim() || "Jugador 2")
    ];
    turno = 0;
    $("seleccion").classList.add("oculto");
    $("arena").classList.remove("oculto");
    $("ganador").classList.add("oculto");
    $("btnRevancha").classList.add("oculto");
    $("btnAtacar").disabled = false;
    $("btnEspecial").disabled = false;
    console.log(`⚔️ ${peleadores[0].nombre} (${peleadores[0].clase}) VS ${peleadores[1].nombre} (${peleadores[1].clase})`);
    pintar();
});
$("btnAtacar").addEventListener("click", () => jugar("atacar"));
$("btnEspecial").addEventListener("click", () => jugar("especial"));
$("btnObjetos").addEventListener("click", () => {
    peleadores.forEach((p) => console.log(p));
});
$("btnRevancha").addEventListener("click", () => {
    $("arena").classList.add("oculto");
    $("seleccion").classList.remove("oculto");
});
console.log("Bienvenido a la Arena TS 187. Elige a tus peleadores.");
