class Boid {

  constructor(boid) {

    // Initial Properties
    this.id = boid.id;
    this.location = new Victor( boid.x, boid.y );
    this.radius = boid.radius * this.getRandomInt(50,100) / 100;
    this.cohesion = boid.cohesion * this.getRandomInt(20,80) / 100;
    this.introversion = boid.introversion * this.getRandomInt(20,80) / 100;
    this.agility = boid.agility * this.getRandomInt(20,80) / 100;
    this.quickness = boid.quickness * this.getRandomInt(50,100) / 100;
    this.racism = boid.racism * this.getRandomInt(20,80) / 100;
    this.color = boid.color;
    this.mass = (4/3) * Math.PI * Math.pow( this.radius,3 );

    // Direction
    this.prevRadians = Math.PI * this.getRandomInt(-99,100) / 100;
    this.radians = this.prevRadians;

    // Speed & Velocity
    this.maxSpeed = 15 * this.quickness;
    this.prevSpeed = this.maxSpeed * .5;
    this.speed = this.prevSpeed;
    this.velocity = new Victor( this.speed * Math.cos( this.radians ), this.speed * Math.sin( this.radians ) );
    //Force and Accel
    this.maxForce = 1;
    this.acceleration = new Victor(0, 0);


  }

  seek( target ) {
    console.log('seeking '+ target.location.x+','+target.location.y);
    var desired = target.location.subtract(this.location);
    desired.normalize();
    desired.multiply(new Victor(this.maxSpeed));
    var steerForce = desired.subtract(this.velocity).normalize().multiply(new Victor(this.maxForce*this.agility,this.maxForce*this.agility));
    this.applyForce(steerForce);
  }

  applyForce( force ){
    this.velocity.add(force);
  }

  nextPosition() {

    var point = {
      location: new Victor(size.width/2,size.height/2)
    }
    // this.seek(point);
    this.velocity = this.velocity.add(this.acceleration);
    // this.wobble();
    this.location = this.location.add(this.velocity);

    // Angle
    this.radians = Math.atan2(this.velocity.y,this.velocity.x);
    this.degrees = this.radians * 180/Math.PI;

  }


  movingRight() {
    if ( this.velocity.x > 0 ) {
      return true;
    } else {
      return false;
    }
  }

  movingDown() {
    if ( this.velocity.y > 0 ) {
      return true;
    } else {
      return false;
    }
  }

  wobble() {
    this.radians = this.radians - this.getRandomInt(-1,1) / 100 * Math.PI;
    this.setVelocities();
  }

  // Check for boid collisions and change course
  avoidTheBoids() {

  }

  // Move towards boids if far away
  approachBoids() {



  }

  // Detect a wall hit and bounce
  wallBounce() {
    if ( this.distanceFromHorWall() < this.radius  ) {
      this.velocity.invertY();

    }
    if ( this.distanceFromVertWall() < this.radius  ) {
      this.velocity.invertX();

    }
  }

  distanceFromVertWall() {
    if (this.movingRight()) {
      return document.body.clientWidth - ( this.location.x );
    } else {
      return this.location.x;
    }

  }

  distanceFromHorWall() {
    if (this.movingDown()) {
      return document.body.clientHeight - ( this.location.y );
    } else {
      return this.location.y;
    }
  }

  getDegrees(radians) {
    var degs = radians * 180 / Math.PI;
    if ( degs < 0 ) {
      return Math.abs(degs);
    } else {
      return 360 - degs;
    }
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  draw(){
    c.beginPath();
    c.arc(this.location.x, this.location.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {

    this.nextPosition();

    this.wallBounce()

    // Collision Detection
    for (var i = 0; i < boids.length; i++) {
      if ( this === boids[i] && this.radius != boids[i].radius ) continue;
      if ( getDistance( this.location.x, this.location.y, boids[i].location.x, boids[i].location.y) - ( this.radius + boids[i].radius ) < 0 ) {
        console.log('collision');
        console.log(this.radius +'+'+ boids[i].radius);
        this.resolveCollision( this, boids[i]);
          // this.velocity.x = 0;
        // this.velocity.y = 0;
        // boids[i].vx = 0;
        // boids[i].vy = 0;
      }
    }

    // Boid avoidance
    // this.avoidTheBoids();

    this.draw();
  }

  /**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

 rotate(velocity, angle) {
    var rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
  }

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */
 resolveCollision(particle, otherParticle) {
    var xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    var yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    var xDist = otherParticle.location.x - particle.location.x;
    var yDist = otherParticle.location.y - particle.location.y;

    // Prevent accidental overlap of particles
    if ( xVelocityDiff * xDist + yVelocityDiff * yDist >= 0 ) {

      // Grab angle between the two colliding particles
      var angle = -Math.atan2(otherParticle.location.y - particle.location.y, otherParticle.location.x - particle.location.x);

      // Store mass in var for better readability in collision equation
      var m1 = particle.mass;
      var m2 = otherParticle.mass;

      // Velocity before equation
      var u1 = this.rotate(particle.velocity, angle);
      var u2 = this.rotate(otherParticle.velocity, angle);

      // Velocity after 1d collision equation
      var v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
      var v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

      // Final velocity after rotating axis back to original location
      var vFinal1 = this.rotate(v1, -angle);
      var vFinal2 = this.rotate(v2, -angle);

      // Swap particle velocities for realistic bounce effect
      particle.velocity.x = vFinal1.x;
      particle.velocity.y = vFinal1.y;

      otherParticle.velocity.x = vFinal2.x;
      otherParticle.velocity.y = vFinal2.y;
    }

  }

}
