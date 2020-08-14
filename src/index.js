import Matter from 'matter-js'
import { degrees, radians } from 'radians'
import random from 'random'
import * as PIXI from 'pixi.js'
import { width, height } from './config'
import './style.scss'


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
	
	// create ragdoll guy
	function createRagdoll(scale) {
		let lowerLeg1 = Bodies.rectangle(0, 100*scale, 10*scale, 30*scale)
		let lowerLeg2 = Bodies.rectangle(20*scale, 100*scale, 10*scale, 30*scale)
		let upperLeg1 = Bodies.rectangle(0, 50*scale, 10*scale, 30*scale)
		let upperLeg2 = Bodies.rectangle(20*scale, 50*scale, 10*scale, 30*scale)
		let torso = Bodies.rectangle(10*scale, 0*scale, 25*scale, 50*scale)
		let head = Bodies.rectangle(10*scale, 0*scale, 25*scale, 25*scale)
		let upperArm1 = Bodies.rectangle(-10*scale, 20*scale, 10*scale, 20*scale)
		let lowerArm1 = Bodies.rectangle(-10*scale, 50*scale, 10*scale, 20*scale)
		let upperArm2 = Bodies.rectangle(40*scale, 20*scale, 10*scale, 20*scale)
		let lowerArm2 = Bodies.rectangle(40*scale, 50*scale, 10*scale, 20*scale)
		lowerLeg1.label = 'lower leg 1'
		upperLeg1.label = 'upper leg 1'
		lowerLeg2.label = 'lower leg 2'
		upperLeg2.label = 'upper leg 2'
		upperArm1.label = 'upper arm 1'
		lowerArm1.label = 'lower arm 1'
		upperArm2.label = 'upper arm 2'
		lowerArm2.label = 'lower arm 2'
		head.label = 'head'
		torso.label = 'torso'

		let renderProps = {
			anchors: false,
			visible: false
		}

		let upperleg1_to_torso = Constraint.create({
			bodyA: upperLeg1,
			bodyB: torso,
			pointA: { x: 0*scale, y: -15*scale },
			pointB: { x: -10*scale, y: 25*scale },
			length: 1*scale,
			render: renderProps
		})
		let upperleg2_to_torso = Constraint.create({
			bodyA: upperLeg2,
			bodyB: torso,
			pointA: { x: 0*scale, y: -15*scale },
			pointB: { x: 10*scale, y: 25*scale },
			length: 1*scale,
			render: renderProps
		})
		let lowerleg1_to_upperleg1 = Constraint.create({
			bodyA: lowerLeg1,
			bodyB: upperLeg1,
			pointA: { x: 0*scale, y: -15*scale },
			pointB: { x: 0*scale, y: 15*scale },
			length: 1*scale,
			render: renderProps
		})
		let lowerleg2_to_upperleg2 = Constraint.create({
			bodyA: lowerLeg2,
			bodyB: upperLeg2,
			pointA: { x: 0*scale, y: -15*scale },
			pointB: { x: 0*scale, y: 15*scale },
			length: 1*scale,
			render: renderProps
		})
		let head_to_torso = Constraint.create({
			bodyA: head,
			bodyB: torso,
			pointA: { x: 0*scale, y: 15*scale },
			pointB: { x: 0*scale, y: -25*scale },
			length: 4*scale,
			render: renderProps
		})
		let upperarm1_to_torso = Constraint.create({
			bodyA: upperArm1,
			bodyB: torso,
			pointA: { x: 0*scale, y: -10*scale },
			pointB: { x: -15*scale, y: -25*scale },
			length: 4*scale,
			render: renderProps
		})
		let lowerarm1_to_upperarm1 = Constraint.create({
			bodyA: upperArm1,
			bodyB: lowerArm1,
			pointA: { x: 0*scale, y: 10*scale },
			pointB: { x: 0*scale, y: -10*scale },
			length: 1*scale,
			render: renderProps
		})
		let upperarm2_to_torso = Constraint.create({
			bodyA: upperArm2,
			bodyB: torso,
			pointA: { x: 0*scale, y: -10*scale },
			pointB: { x: 15*scale, y: -25*scale },
			length: 4*scale,
			render: renderProps
		})
		let lowerarm2_to_upperarm2 = Constraint.create({
			bodyA: upperArm2,
			bodyB: lowerArm2,
			pointA: { x: 0*scale, y: 10*scale },
			pointB: { x: 0*scale, y: -10*scale },
			length: 1*scale,
			render: renderProps
		})

		let collection = Composite.create({
		})
		Composite.add(collection, [
			head, torso,
			lowerLeg1, lowerLeg2,
			upperLeg1, upperLeg2,
			upperArm1, lowerArm1,
			upperArm2, lowerArm2,
			upperleg1_to_torso, upperleg2_to_torso,
			lowerleg1_to_upperleg1, lowerleg2_to_upperleg2,
			head_to_torso,
			upperarm1_to_torso, lowerarm1_to_upperarm1,
			upperarm2_to_torso, lowerarm2_to_upperarm2,

		])

		return collection
	}

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
