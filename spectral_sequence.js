// Plotting parameters
let spacing = 100;
let padding = 10;

// Set default settings
let n = 2; // Current page
let min_p = parseInt(min_p_input.value);
let max_p = parseInt(max_p_input.value);
let min_q = parseInt(min_q_input.value);
let max_q = parseInt(max_q_input.value);
let is_homological = false;

let ss = document.getElementById("spectral_sequence");
let context = ss.getContext('2d');
let terms;

// Creates term and assigns it its coordiantes
function term(p_value, q_value) {
    let starting_x = spacing * Math.abs(min_p);

    let term = {
        p: p_value,
        q: q_value,
        x: starting_x + spacing * p_value,
        y: spacing * (max_q - q_value),
    }
    return term;
}

function draw_terms() {
    for (t of terms.values()) {
        // Color and styling
        let styling = "";
        if (t.p < 0 || t.q < 0) {
            context.fillStyle = "#000";
        } else if (t.p - n < 0 && t.q + (1 - n) < 0) {
            context.fillStyle = "#222";
            styling = "bold ";
        } else {
            context.fillStyle = "#888";
        }

        // Draw terms
        context.font = styling + "20px Georgia, Times, serif";
        if (t.p < 0 || t.q < 0) { // Spectral sequence is supported in first quadrant
            context.fillText("0", t.x + 8.5, t.y - 10);
        } else {
            context.fillText("E", t.x + 5, t.y - 10);
            context.font = styling + "10px Georgia, Times, serif";

            if (is_homological) {
                context.fillText(t.p + "," + t.q, t.x + 20, t.y - 8);
                context.fillText(n, t.x + 20, t.y - 20);
            } else {
                context.fillText(t.p + "," + t.q, t.x + 20, t.y - 20);
                context.fillText(n, t.x + 20, t.y - 8);
            }
        }
    }
}

function draw_arrows() {
    for (t of terms.values()) {
        let p = t.p;
        let q = t.q;
        let p2 = p + n;
        let q2 = q + 1 - n;
        let source = terms.get(`${p},${q}`);
        let target = terms.get(`${p2},${q2}`);

        if (target === undefined) {
            continue;
        } else if (q2 < min_q || p2 + q2 >= max_p + max_q) {
            continue;
        } else {
            let angle = Math.atan2(1 - n, n); // slope: -(n-1)/n

            var head, tail;
            if (n == 0) {
                // Vertical arrows require different padding to align correctly
                tail = {
                    x: source.x + 15 + padding * Math.cos(angle),
                    y: source.y - 20 - padding * Math.sin(angle),
                };
                head = {
                    x: target.x + 15 - padding * Math.cos(angle),
                    y: target.y - 10 + padding * Math.sin(angle),
                }
            } else {
                if (is_homological) {
                    // Homological targets requires a little more padding in
                    // the x direction as they have a longer subscript.
                    tail = {
                        x: source.x + 30 + padding * Math.cos(angle),
                        y: source.y - 15 - padding * Math.sin(angle),
                    }
                } else {
                    tail = {
                        x: source.x + 20 + padding * Math.cos(angle),
                        y: source.y - 15 - padding * Math.sin(angle),
                    }
                }
                head = {
                    x: target.x + 10 - padding * Math.cos(angle),
                    y: target.y - 15 + padding * Math.sin(angle),
                }
            }

            if (is_homological) {
                [head, tail] = [tail, head];
            }

            // Draw arrow shaft
            context.beginPath();
            context.moveTo(tail.x, tail.y);
            context.lineTo(head.x, head.y);
            context.save();
            context.translate(head.x, head.y);

            // Draw arrow head
            if (is_homological) {
                angle += Math.PI;
            }
            context.rotate(-angle);
            context.moveTo(-5, 4);
            context.lineTo(0, 0);
            context.moveTo(-5, -4);
            context.lineTo(0, 0);

            context.restore();
            context.stroke();
        }

    }
}

let render = function () {
    min_p = parseInt(min_p_input.value);
    max_p = parseInt(max_p_input.value);
    min_q = parseInt(min_q_input.value);
    max_q = parseInt(max_q_input.value);

    ss.width = (max_p - min_p) * spacing - 60;
    ss.height = (max_q - min_q) * spacing;
    context.clearRect(0, 0, ss.width, ss.height);

    document.getElementById("page").innerHTML = "Page " + n;

    terms = new Map();
    for (let p = min_p; p < max_p + max_q + n; p++) {
        for (let q = min_q; q < max_p + max_q + n; q++) {
            terms.set(`${p},${q}`, term(p, q));
        }
    }

    draw_terms();
    draw_arrows();
}

function decrement() {
    if (n > 0) {
        n--;
        render();
    }
}

function increment() {
    if (n < max_p + max_q) { n++; render(); }
}

function set_cohomological() {
    is_homological = false;
    render();
}

function set_homological() {
    is_homological = true;
    render();
}

render();
min_p_input.onchange = render;
max_p_input.onchange = render;
min_q_input.onchange = render;
max_q_input.onchange = render;

document.onkeydown = function (key) {
    switch (key.keyCode) {
        case 37: /* Left arrow */ decrement(); break;
        case 39: /* Right arrw */ increment(); break;
    }
}