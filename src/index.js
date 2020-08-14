import Matter from 'matter-js'
import { degrees, radians } from 'radians'
import random from 'random'
import * as PIXI from 'pixi.js'
import { width, height } from './config'
import './style.scss'
import {
	createRagdoll
} from 'matterjs-ragdoll'


window.start = () => {

	// PIXI js
	let app = new PIXI.Application({
		width: width, height: height
	})
	document.body.appendChild(app.view)
	app.view.id = 'pixijs'

	// Matter js
  let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  World = Matter.World,
	Constraint = Matter.Constraint,
	Composite = Matter.Composite,
	Composites = Matter.Composites,
  Bodies = Matter.Bodies,
	Body = Matter.Body,
	Events = Matter.Events;

	// create engine
	let engine = Engine.create()
	let world = engine.world
	let runner = Runner.create()
	let renderer = Render.create({
		element: document.body,
		engine: engine,
		options: {
			width: width,
			height: height,
			pixelRatio: 1,
			enabled: true,
			wireframes: true,
			showVelocity: false,
			showAngleIndicator: false,
			showCollisions: true
		}
	})
	renderer.canvas.id = 'matterjs'
	// renderer.canvas.style.opacity = .5
	// run physics
	Render.run(renderer)
	Runner.run(runner, engine)

	Events.on(engine, 'beforeTick', e => {

	})

	let mouse = Mouse.create(renderer.canvas)
	let mouseOptions = {
		stiffness: .5
	}
	let mouseConstraint = MouseConstraint.create(engine, {
		mouse,
		constraint: mouseOptions
	})

	let ground = Bodies.rectangle(width/2, height + 50, width, 200)
	Body.setStatic(ground, true)

	let head = Bodies.polygon(200, 0, 8, 50, {
		chamfer: {
			radius: 10
		}
	})

	let shtring = Composites.stack(0, 0, 25, 1, 0, 0, (x, y) => {
		return Bodies.circle(x, y, 15, {
			collisionFilter: { group: Body.nextGroup(true) }
		})
	})
	let chain = Composites.chain(shtring, 0, 0, 0, 0, {
		stiffness: 1
	})
	let chain_to_head = Constraint.create({
		bodyA: head,
		bodyB: shtring.bodies[0],
		pointA: { x: 40, y: 0 },
		length: 20
	})
	// console.log(shtring.bodies[0])
	let box1 = Bodies.rectangle(0, 300, 50, 200, { isStatic: true })
	let box2 = Bodies.rectangle(800, 300, 50, 200, { isStatic: true })
	let shtringLeftAttach = Constraint.create({
		bodyA: box1,
		bodyB: shtring.bodies[0],
		pointA: { x: 25, y: -100 },
		length: 10
	})
	let shtringRightAttach = Constraint.create({
		bodyA: box2,
		bodyB: shtring.bodies[shtring.bodies.length-1],
		pointA: { x: -25, y: -100 },
		length: 10
	})
	let stack = Composites.stack(width/2 - ((30 * 10)/2), 0, 10, 5, 0, 0, (x, y) => (
		Bodies.rectangle(x, y, 30, 30)
	))

	World.add(world, [
		// ground,
		box1, box2,
		shtringLeftAttach,
		shtringRightAttach,
		// head,
		chain,
		// chain_to_head,
		mouseConstraint,
		// ragdoll,
		// stack
	])

	setTimeout(() => {
		let ragdoll = createRagdoll(1)
		World.add(world, [ragdoll])
		Composite.translate(ragdoll, { x: 200, y: 0 })
	}, 3000)

	// fit the render viewport to the scene
	Render.lookAt(renderer, {
		min: { x: 0, y: 0 },
		max: { x: width, y: height }
	})

	function render() { // custom render()
	}
	// render()

  // context for MatterTools.Demo
  return {
    engine: engine,
    runner: runner,
    render: renderer,
    canvas: renderer.canvas,
    stop: () => {
      Matter.Render.stop(renderer)
      Matter.Runner.stop(runner)
    }
  }

}
