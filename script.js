function $_ (key) { return document.querySelector(key) }

let currenttab = 'calc'
let installprompt = null
let graphSize = [500, 600]

function switchScreen (screen) {
    $_`#calculator`.style.display = screen == 'calc' ? 'block' : 'none'
    $_`#graph`.style.display = screen == 'graph' ? 'block' : 'none'
    switch (screen) {
        case 'calc': {
            if (currenttab == 'graph') {
                graphSize = [window.outerWidth, window.outerHeight]
            }
            window.resizeTo(500, 600)
        }; break;
        case 'graph': {
            window.resizeTo(graphSize[0], graphSize[1])
        }; break;
    }
    currenttab = screen
}
setTimeout(() => {
    switchScreen('calc')
})

window.addEventListener("beforeinstallprompt", (event) => {
    installprompt = event
    event.preventDefault()
});

let calculator = {
    currentInput: "",
    result: "",
    showRes: false,
    openP: 0,
    history: [],
    update: () => {
        if (calculator.showRes) {
            $_`#calculator`.classList.remove('current')
            calculator.showRes = false
            $_`#old`.innerText = calculator.currentInput
            $_`#current`.innerText = calculator.result
            calculator.history.push({action: calculator.result, result: calculator.currentInput})
            calculator.result = ''
            calculator.currentInput = ''
        } else {
            $_`#calculator`.classList.add('current')
            $_`#current`.innerText = calculator.currentInput
            $_`#old`.innerText = calculator.result
        }
        $_`#current`.scroll(999999, 0)
        $_`#old`.scroll(999999, 0)
        $_`#history`.innerHTML = calculator.history.reduce((cur, val) => {
            return cur + `<div class="historyItem">
                    <button class="input" onclick="calculator.type('${val.action}')">${val.action}</button>
                    <button class="result" onclick="calculator.type('${val.result}')">${val.result}</button>
                </div>`}, ``)
    },
    type: (char) => {
        for (let i = 0; i < char.length; i++) {
            if (char[i] == '.') {
                if (calculator.currentInput.length && calculator.currentInput[calculator.currentInput.length - 1].match(/[0-9]/)) {
                    calculator.currentInput += char[i]
                }
            } else {
                calculator.currentInput += char[i]
            }
        }
        calculator.update()
    },
    action: (action) => {
        switch (action) {
            case 1: {
                if (calculator.currentInput == '' && calculator.history.length > 0) {
                    calculator.currentInput = calculator.history[calculator.history.length - 1].result
                }
                if (!(['÷', '×', '−', '+'].includes(calculator.currentInput[calculator.currentInput.length - 1])) ) {
                    calculator.currentInput += '+'
                }
            }; break;
            case 2: {
                if (calculator.currentInput == '' && calculator.history.length > 0) {
                    calculator.currentInput = calculator.history[calculator.history.length - 1].result
                }
                if (!(['÷', '×', '−', '+'].includes(calculator.currentInput[calculator.currentInput.length - 1]))) {
                    calculator.currentInput += '−'
                }
            }; break;
            case 3: {
                if (calculator.currentInput == '' && calculator.history.length > 0) {
                    calculator.currentInput = calculator.history[calculator.history.length - 1].result
                }
                if (!(['÷', '×', '−', '+'].includes(calculator.currentInput[calculator.currentInput.length - 1]))) {
                    calculator.currentInput += '×'
                }
            }; break;
            case 4: {
                if (calculator.currentInput == '' && calculator.history.length > 0) {
                    calculator.currentInput = calculator.history[calculator.history.length - 1].result
                }
                if (!(['÷', '×', '−', '+'].includes(calculator.currentInput[calculator.currentInput.length - 1]))) {
                    calculator.currentInput += '÷'
                }
            }; break;
            case 5: {
                if (calculator.currentInput == '' && calculator.history.length > 0) {
                    calculator.currentInput = calculator.history[calculator.history.length - 1].result
                }
                if (!(['÷', '×', '−', '+', '%'].includes(calculator.currentInput[calculator.currentInput.length - 1]))) {
                    calculator.currentInput += '%'
                }
            }; break;
            case 6: {
                if ( calculator.currentInput.length && calculator.openP > 0 && calculator.currentInput[calculator.currentInput.length - 1].match(/([0-9]|\()/) ) {
                    calculator.currentInput += ')'
                    calculator.openP--
                } else {
                    calculator.currentInput += '('
                    calculator.openP++
                }
            }; break;
            case 7: {
                calculator.currentInput = ''
                calculator.result = ''
            }; break;
            case 8: {
                calculator.currentInput = calculator.currentInput.substring(0, calculator.currentInput.length-1)
            }; break;
            case 9: {
                if (calculator.currentInput.length) {
                    calculator.result = calculator.currentInput
                    let act = calculator.result
                    while (1) {
                        let match = act.match(/([0-9.]+)%/)
                        if (!match) { break }
                        act = act.replaceAll(match[0], match[1]/100)
                    }
                    try {
                        calculator.currentInput = eval(act.replaceAll('÷', '/').replaceAll('×', '*').replaceAll('+', '+').replaceAll('−', '-').replaceAll(')(', ')*('))
                    } catch (e) {
                        calculator.currentInput = 'Error'
                    }
                    calculator.showRes = true
                }
            }; break;
        }
        calculator.update()
    },
    keyHandler: (key) => {
        if (key == '*') { calculator.action(3) }
        else if (key == '/') { calculator.action(4) }
        else if (key == '%') { calculator.action(5) }
        else if (key == '+') { calculator.action(1) }
        else if (key == '-') { calculator.action(2) }
        else if (key == 'Backspace') { calculator.action(8) }
        else if (key == 'Enter') { calculator.action(9) }
        else { calculator.type(key) }
    }
}

function calculateDistance (x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

let graph = {
    functions: {},
    shouldItBeDisplayed: {},
    compileFunctions: () => {
        let functions = document.querySelectorAll('.function')
        let functionsCompiled = {}
        graph.shouldItBeDisplayed = {}
        for (let i = 0; i < functions.length; i++) {
            if ( functions[i].childNodes[7].innerText == '' ) {
                functions[i].childNodes[6].style.opacity = '0.1'
                functions[i].childNodes[8].style.opacity = '0.1'
            } else {
                functions[i].childNodes[6].style.opacity = '1'
                functions[i].childNodes[8].style.opacity = '1'
            }
            if ( i < functions.length - 1 && functions[i].childNodes[5].innerText == '' ) {
                functions[i].remove()
            } else {
                try {
                    let compiled = compileFunction(functions[i])
                    functionsCompiled[compiled[0]] = compiled[1]
                    graph.shouldItBeDisplayed[compiled[0]] = compiled[2]
                } catch (e) {
                    //console.warn(e)
                }
            }
        }
        if (functions.length == 0 || functions[functions.length - 1].childNodes[5].innerText != '') {
            let function_ = document.querySelector('div[prefab="function"]').cloneNode(true)
            function_.classList.add('function')
            function_.removeAttribute('prefab')
            document.querySelector('#functions').append(function_)
        }
        graph.functions = functionsCompiled
    },
    view: {x: 0, y: 0, scale: 50},
    mouse: {x: 0, y: 0},
    holding: false,
    ctx: document.getElementById('canvasgraph').getContext('2d'),
    canvas: document.getElementById('canvasgraph'),
    render: () => {
        graph.canvas.width = graph.canvas.getBoundingClientRect().width
        graph.canvas.height = graph.canvas.getBoundingClientRect().height
        graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height)
        graph.ctx.strokeStyle = 'black'
        graph.ctx.lineWidth = 2;
        graph.ctx.beginPath()
        graph.ctx.moveTo(graph.view.x + graph.canvas.width / 2, 0)
        graph.ctx.lineTo(graph.view.x + graph.canvas.width / 2, graph.canvas.height)
        graph.ctx.moveTo(0, graph.view.y + graph.canvas.height / 2)
        graph.ctx.lineTo(graph.canvas.width, graph.view.y + graph.canvas.height / 2)
        graph.ctx.stroke();
        let colors = ['red', 'green', 'blue', 'yellow', 'mediumpurple', 'aquamarine', 'brown', 'blueviolet', 'gold', 'gray', 'lavender', 'lightblue', 'lightgreen']
        graph.compileFunctions()
        {
            let max = ((graph.canvas.width / 2) - graph.view.x) / graph.view.scale
            for (let x = Math.round(((0 - (graph.canvas.width / 2) - graph.view.x) / graph.view.scale) * ((Math.floor((graph.view.scale - 50) / 50)) + 1)) / ((Math.floor((graph.view.scale - 50) / 50)) + 1); x <= max; x += 1 / ((Math.floor((graph.view.scale - 50) / 50)) + 1)) {
                if (Math.round(x * 1000) / 1000 != 0) {
                    graph.ctx.strokeStyle = '#eee'
                    graph.ctx.beginPath()
                    graph.ctx.moveTo((x * graph.view.scale) + graph.view.x + (graph.canvas.width / 2), 0)
                    graph.ctx.lineTo((x * graph.view.scale) + graph.view.x + (graph.canvas.width / 2), graph.canvas.height)
                    graph.ctx.stroke();
                    graph.ctx.strokeStyle = 'black'
                    graph.ctx.font = '16px sans-serif'
                    graph.ctx.fillText(Math.round(x*1000)/1000, (x * graph.view.scale) + graph.view.x + (graph.canvas.width / 2), graph.view.y + (graph.canvas.height / 2) + 20)
                    graph.ctx.beginPath()
                    graph.ctx.moveTo((x * graph.view.scale) + graph.view.x + (graph.canvas.width / 2), graph.view.y + (graph.canvas.height / 2) - 5)
                    graph.ctx.lineTo((x * graph.view.scale) + graph.view.x + (graph.canvas.width / 2), graph.view.y + (graph.canvas.height / 2) + 5)
                    graph.ctx.stroke();
                }
            }
        }
        {
            let max = ((graph.canvas.height / 2) - graph.view.y) / graph.view.scale
            for (let x = Math.round(((0 - (graph.canvas.height / 2) - graph.view.y) / graph.view.scale) * ((Math.floor((graph.view.scale - 50) / 50)) + 1)) / ((Math.floor((graph.view.scale - 50) / 50)) + 1); x <= max; x += 1 / ((Math.floor((graph.view.scale - 50) / 50)) + 1)) {
                if (Math.round(x * 1000) / 1000 != 0) {
                    graph.ctx.strokeStyle = '#eee'
                    graph.ctx.beginPath()
                    graph.ctx.moveTo(0, (x * graph.view.scale) + graph.view.y + (graph.canvas.height / 2))
                    graph.ctx.lineTo(graph.canvas.width, (x * graph.view.scale) + graph.view.y + (graph.canvas.height / 2))
                    graph.ctx.stroke();
                    graph.ctx.strokeStyle = 'black'
                    graph.ctx.font = '18px sans-serif'
                    graph.ctx.fillText(-(Math.round(x * 1000) / 1000), graph.view.x + (graph.canvas.width / 2) + 7, (x * graph.view.scale) + graph.view.y + (graph.canvas.height / 2) + 20)
                    graph.ctx.beginPath()
                    graph.ctx.moveTo(graph.view.x + (graph.canvas.width / 2) - 5, (x * graph.view.scale) + graph.view.y + (graph.canvas.height / 2))
                    graph.ctx.lineTo(graph.view.x + (graph.canvas.width / 2) + 5, (x * graph.view.scale) + graph.view.y + (graph.canvas.height / 2))
                    graph.ctx.stroke();
                }
            }
        }
        let k = Object.keys(graph.functions)
        let highlight = { x: undefined, y: undefined, distance: Infinity, function: undefined, cx: undefined, cy: undefined, color: undefined }
        for (let i = 0; i < k.length; i++) {
            if (graph.shouldItBeDisplayed[k[i]]) {
                try {
                    graph.ctx.strokeStyle = colors[Math.min(i, colors.length - 1)]
                    graph.ctx.lineWidth = 2;
                    graph.ctx.beginPath();
                    graph.ctx.moveTo(-1, 0)
                    for (let x = 0; x <= graph.canvas.width; x++) {
                        let num = (x - (graph.canvas.width / 2) - graph.view.x) / graph.view.scale
                        graph.ctx.lineTo(x, ((graph.canvas.height / 2) - graph.functions[k[i]](0, num) * graph.view.scale) + graph.view.y)
                        graph.ctx.moveTo(x, ((graph.canvas.height / 2) - graph.functions[k[i]](0, num) * graph.view.scale) + graph.view.y)

                        if (highlight.distance > calculateDistance(x, ((graph.canvas.height / 2) - graph.functions[k[i]](0, num) * graph.view.scale) + graph.view.y, graph.mouse.x - 55, graph.mouse.y) && calculateDistance(x, ((graph.canvas.height / 2) - graph.functions[k[i]](0, num) * graph.view.scale) + graph.view.y, graph.mouse.x - 55, graph.mouse.y) < 20) {
                            highlight.x = x
                            highlight.y = ((graph.canvas.height / 2) - graph.functions[k[i]](0, num) * graph.view.scale) + graph.view.y
                            highlight.cx = num
                            highlight.cy = graph.functions[k[i]](0, num)
                            highlight.function = k[i]
                            highlight.distance = calculateDistance(x, ((graph.canvas.height / 2) - graph.functions[k[i]](0, num) * graph.view.scale) + graph.view.y, graph.mouse.x - 55, graph.mouse.y)
                            highlight.color = colors[Math.min(i, colors.length - 1)]
                        }

                        //graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height)
                    }
                    graph.ctx.stroke();
                    //console.log(graph.ctx.strokeStyle)
                } catch (e) {
                    //console.warn(e)
                }
                //console.log(i)
            }
        }
        if (highlight.function) {
            graph.ctx.strokeStyle = 'grey'
            graph.ctx.lineWidth = 4
            graph.ctx.beginPath();
            graph.ctx.arc(highlight.x, highlight.y, 5, 0, 2 * Math.PI);
            graph.ctx.stroke();
            graph.ctx.lineWidth = 2
            graph.ctx.strokeStyle = highlight.color
            graph.ctx.beginPath();
            graph.ctx.arc(highlight.x, highlight.y, 5, 0, 2 * Math.PI);
            graph.ctx.stroke();
            graph.ctx.strokeStyle = 'black'
            graph.ctx.font = '15px sans-serif'
            graph.ctx.fillText(`${highlight.function}, x=${highlight.cx.toPrecision(5)}, y=${highlight.cy.toPrecision(5)}`, highlight.x + 10, highlight.y + 10)
        }
        graph.ctx.font = '20px sans-serif'
        graph.ctx.fillText(graph.view.scale, graph.canvas.width - 50, graph.canvas.height - 50)
        requestAnimationFrame(graph.render)
    }
}
graph.render()
graph.canvas.addEventListener('wheel', (event) => {
    graph.view.scale = Math.max(50, graph.view.scale - event.deltaY/20)
})
window.addEventListener('mousemove', (event) => {
    graph.mouse.x = event.x
    graph.mouse.y = event.y
    if (graph.holding) {
        graph.view.x += event.movementX
        graph.view.y += event.movementY
    }
})
graph.canvas.addEventListener('mousedown', (event) => {
    graph.holding = true
    event.preventDefault()
})
window.addEventListener('mouseup', (event) => {
    graph.holding = false
})



window.addEventListener('keydown', (ev) => {
    if (ev.key.match(/(^[0-9\*\/\-+\(\)]|Backspace|Enter|\.|%)/)) {
        if (currenttab == 'calc') {
            event.preventDefault()
            calculator.keyHandler(ev.key)
        }
    }
})

function compileFunction(element) {
    let fu = element.childNodes[10].innerText.replaceAll(/([0-9])([a-z])/g, '$1*$2').replaceAll(/([0-9])\(/g, '$1*(').replaceAll(/\)([0-9])/g, ')*$1').replaceAll(' ', '').replaceAll(' ', '').replaceAll(/([a-zA-Z]+)\(/g, '$1_(').replaceAll('pi', 'Math.PI')
    
    while (1) {
        let match = fu.match(/([a-zA-Z]+)_\(/)
        if (!match) { break }
        if (Object.keys(graph.functions).includes(match[1])) {
            fu = fu.replaceAll(match[0], `graph.functions['${match[1]}'](inside_+1, x, `)
        } else {
            fu = fu.replaceAll(match[0], `Math.${match[1]}(`)
        }
    }
    let fun = (_inside, x) => {}
    let ret = undefined
    try {
        fun = new Function(['inside_', 'x'].concat(element.childNodes[7].innerText.replaceAll(' ', '').replaceAll(' ', '').split(',')).join(', '), `if (inside_ > 100) {return} return ${fu}`)
        ret = fun(0, 0)
        element.childNodes[1].style.display = 'none'
        element.childNodes[3].style.display = 'block'
    } catch (e) {
        element.childNodes[1].style.display = 'block'
        element.childNodes[3].style.display = 'none'
    }
    return [
        element.childNodes[5].innerText,
        fun,
        ['inside_', 'x'].concat(element.childNodes[7].innerText.replaceAll(' ', '').replaceAll(' ', '').split(',')).length == 3
    ]
}
