/* ==========================================================================
   DRONE QUEST - site content
   --------------------------------------------------------------------------
   Everything the visitor reads lives in this file. The game (map, buildings,
   menus) reads from here, so updating the site = editing this file.

   - Text fields accept HTML (<p>, <ul>, <strong>, <a>...).
   - An empty string ("") is shown on the site as a "??? Coming soon" box.
   - Media items:
       { type: "img",     src: "assets/img/file.jpg", caption: "..." }
       { type: "video",   src: "assets/img/file.mp4", caption: "..." }
       { type: "youtube", id:  "VIDEO_ID",            caption: "..." }
   - Dates use the format YYYY-MM-DD.
   ========================================================================== */

window.SITE = {
  title: "DRONE QUEST",
  subtitle: "TRANSVERSAL PROJECT",
  master: "MASTER IN APPLICATIONS AND TECHNOLOGIES FOR UAS",

  /* The order is the order of the character select screen.
     "id" links each member with their pixel character (engine.js, LOOKS). */
  team: {
    name: "GROUP 3",
    intro: "<p>We are <strong>Group 3</strong> of the EETAC Transversal Drone Project: Aatif, Dídac, Timur and Ashwin. In Phase 1 we built a Hexsoon EDU 450 quadcopter from its components, configured it and flew it in the DroneLab.</p>" +
      "<p>We had no fixed roles: the four of us worked together on every task, from the assembly to the flight.</p>",
    members: [
      { id: "aatif",  name: "Aatif",  fullName: "Aatif Muneer",   role: "", bio: "" },
      { id: "didac",  name: "Dídac",  fullName: "Dídac Bosch",    role: "", bio: "" },
      { id: "timur",  name: "Timur",  fullName: "Timur Turganov", role: "", bio: "" },
      { id: "ashwin", name: "Ashwin", fullName: "Ashwin Kumaar",  role: "", bio: "" }
    ]
  },

  /* One world per version of the project site. Only World 1 is open. */
  worlds: [
    { id: 1, label: "V1",    name: "VERSION 1",     subtitle: "PHASE 1: FROM COMPONENTS TO FIRST FLIGHT", unlocked: true },
    { id: 2, label: "V2",    name: "VERSION 2",     subtitle: "COMING SOON", unlocked: false },
    { id: 3, label: "V3",    name: "VERSION 3",     subtitle: "COMING SOON", unlocked: false },
    { id: 4, label: "V4",    name: "VERSION 4",     subtitle: "COMING SOON", unlocked: false },
    { id: 5, label: "FINAL", name: "FINAL VERSION", subtitle: "COMING SOON", unlocked: false }
  ],

  /* Quest log: dated updates, newest first. */
  updates: [
    {
      date: "2026-10-20",
      category: "Media",
      title: "Our flight on video",
      text: "Activity 8 now has a video of our drone flying inside the DroneLab net, plus new photos: the drone powered on before the flight, a top view and another team photo with the drone.",
      link: "#/world/1/activity/8"
    },
    {
      date: "2026-10-20",
      category: "Site",
      title: "Close-ups, a better 3D model and the inventory in the warehouse",
      text: "In the HANGAR, every component of the real photo now opens the official photo of that part, with its source. The 3D model is much more detailed (carbon plates, motor windings, wiring, propellers, the LiPo battery), has an exploded view and you can click its parts to identify them. The parts shop has closed: the kit inventory with where to buy and prices is now a tab inside the Unboxing warehouse (building 2).",
      link: "#/world/1/hangar"
    },
    {
      date: "2026-10-20",
      category: "Site",
      title: "New building: the HANGAR",
      text: "Next to the DroneLab there is a new building with our real drone: a photo with clickable components (each one with the official photo of that part), a 3D model you can spin and a walk-around video. The labs also have a new SEE THE REAL ONE button that swaps the pixel art for a real photo.",
      link: "#/world/1/hangar"
    },
    {
      date: "2026-10-18",
      category: "Media",
      title: "Photos, videos and flight results",
      text: "Our photos and videos are now in the reports, from the unboxing to the team at the DroneLab. We also added our own diagrams (subsystems, motor layout, compass problem), the motor test table and the results of our test flight, plus a glossary in the library.",
      link: "#/world/1/activity/8"
    },
    {
      date: "2026-10-18",
      category: "Phase 1",
      title: "Phase 1 reports are online",
      text: "The eight buildings of World 1 now hold our reports: from the basics of a drone to the assembly, the radio and autopilot set-up, the final calibrations and our first flight in the DroneLab, with a geofence you can draw yourself before taking off. We also added the troubleshooting page, our ideas for phase 2 and our first reflection. Photos and videos coming next!",
      link: "#/world/1/activities"
    },
    {
      date: "2026-10-04",
      category: "Site",
      title: "Welcome to Drone Quest!",
      text: "First version of our project site: world map, World 1 and the structure for every Phase 1 activity. Content, photos and videos are on their way.",
      link: ""
    }
  ],

  /* Phase 1 activities = the buildings of World 1 (in this order). */
  activities: [
    {
      n: 1,
      short: "BASICS",
      title: "The very basics of a drone and its components",
      date: "2026-09-10",
      tags: ["theory", "components"],
      done: true,
      real: { src: "assets/img/hangar/drone.jpg", caption: "Our real drone: every component of this diagram, assembled" },
      objective: "<p>Get a global picture of a drone system before touching any hardware: how a quadcopter generates lift, stays stable, receives commands and talks to a ground control station.</p>",
      work: "<p>We studied the introductory material and the videos of the EETAC guide (see the links below) to understand how the drone works and how its components are related. To make it simpler, we split the system into five subsystems: power, propulsion, control, navigation and communication (see our diagram below).</p>" +
        "<p>The Hexsoon EDU 450 is a quadcopter with four brushless motors. By changing the speed of each motor, the drone can take off, land and move in roll, pitch and yaw. These are its main components:</p>" +
        "<ul>" +
        "<li><strong>Frame:</strong> the structure that holds the motors, the electronics and everything else.</li>" +
        "<li><strong>Brushless motors:</strong> spin the propellers to produce thrust.</li>" +
        "<li><strong>ESCs (electronic speed controllers):</strong> set the speed of each motor according to the control signal.</li>" +
        "<li><strong>Power distribution board (PDB):</strong> shares the battery power between the propulsion system and the rest of the equipment.</li>" +
        "<li><strong>Orange Cube autopilot:</strong> the flight controller, which reads the sensors and controls the aircraft.</li>" +
        "<li><strong>GPS and compass:</strong> position and heading for navigation.</li>" +
        "<li><strong>Radio transmitter and receiver:</strong> the link between the pilot and the drone.</li>" +
        "<li><strong>Telemetry radio:</strong> the link between the drone and the ground control station.</li>" +
        "<li><strong>LiPo battery:</strong> the energy for the whole system.</li>" +
        "</ul>" +
        "<p>We also got familiar with <strong>Mission Planner</strong>, the ground control software used to configure the autopilot and monitor the drone. Finally, we compared manual radio control with the stabilisation done by the autopilot, looked at the different flight modes and saw why sensor calibration matters. This gave us the theory we needed for the assembly and configuration activities.</p>" +
        "<p>A quadcopter has no control surfaces: every movement comes from changing the speed of the four motors.</p>" +
        "<div class=\"table-wrap\"><table><thead><tr><th>Movement</th><th>How the motors produce it</th></tr></thead><tbody>" +
        "<tr><td>Take-off / landing</td><td>All four motors speed up or slow down together.</td></tr>" +
        "<tr><td>Roll</td><td>Thrust shifts between the left and the right motors.</td></tr>" +
        "<tr><td>Pitch</td><td>Thrust shifts between the front and the rear motors.</td></tr>" +
        "<tr><td>Yaw</td><td>The clockwise pair spins at a different speed from the counter-clockwise pair.</td></tr>" +
        "</tbody></table></div>",
      media: [
        { type: "img", src: "assets/img/w1/a1-subsystems.png", wide: true, caption: "Our diagram of the drone subsystems and the signals between them" }
      ],
      difficulties: "<p><strong>Problem:</strong> at the beginning it was hard to see how all the electronic and mechanical parts work together.</p>" +
        "<p><strong>Solution:</strong> we split the drone into subsystems (propulsion, power, control, navigation and communication) and studied what each one does before looking at how they connect.</p>",
      learned: "<p>A drone is much more than a frame with four motors: a reliable flight depends on many subsystems working together. Seeing the drone this way helped us later, when we had to track down the compass calibration problem (activity 5).</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #1 (intro video)", url: "https://www.youtube.com/watch?v=c2Aa_KSdEwo" },
        { t: "Radio control", url: "https://www.youtube.com/watch?v=LyPtzv0y5DE" },
        { t: "ESC", url: "https://www.youtube.com/watch?v=OZNxbxL7cdc" },
        { t: "Brushless motors", url: "https://www.youtube.com/watch?v=uLutMoh4Ttg" },
        { t: "Flight controllers vs flight computers", url: "https://www.youtube.com/watch?v=PlKeFj5teo4" },
        { t: "Mission Planner", url: "https://www.youtube.com/watch?v=z_sZUOrnfY8" },
        { t: "Flight modes", url: "https://www.youtube.com/watch?v=mSSbjo9pYgM" }
      ]
    },
    {
      n: 2,
      short: "UNBOXING",
      title: "Unboxing",
      date: "2026-09-10",
      tags: ["kit", "inventory"],
      done: true,
      real: { src: "assets/img/w1/a2-kit.jpg", caption: "The real kit on our table" },
      inventory: true,   // this building also shows the kit inventory (where to buy, price)
      objective: "<p>Check that the kit contains every component and tool needed for the assembly, and record its initial condition: the kit must be returned exactly as it was received.</p>",
      work: "<p>We opened the Hexsoon EDU 450 kit and identified every component: frame parts, motors, ESCs, power distribution board, Orange Cube autopilot, FrSky radio transmitter and receiver, Here3 GPS and compass module, SiK telemetry radios, LiPo battery and the Raspberry Pi kit for phase 2 (open the box yourself in the OPEN THE BOX tab, and see where to buy each part and its price in the INVENTORY tab).</p>" +
        "<p>We sorted the components by function and by the activity in which we would need them. We paid special attention to the motors, ESCs, frame parts, power connections and autopilot, because they were needed in the first assembly sessions.</p>" +
        "<p>We also looked at the connectors and cables to understand how power and control signals travel through the aircraft, and we checked that the parts were in good condition before starting the assembly.</p>",
      media: [
        { type: "img", src: "assets/img/w1/a2-kit.jpg", caption: "The Hexsoon EDU 450 box with the Cube autopilot, the Here3 GPS, the SiK telemetry radio and the FrSky radio case" }
      ],
      difficulties: "<p>No major problems in this activity: the kit was complete and we could identify every component.</p>",
      learned: "<p>Preparation is part of the engineering work. Having every part identified and organised before the assembly prevents wiring mistakes, avoids confusion and makes troubleshooting much easier.</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #2: Unboxing", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450#actividad-2-unboxing" }
      ]
    },
    {
      n: 3,
      short: "FRAME ASSEMBLY 1",
      title: "Frame assembly (part 1)",
      date: "2026-09-10",
      tags: ["assembly", "hardware"],
      done: true,
      real: { src: "assets/img/w1/a3-frame.jpg", caption: "Our real frame: arms, motors and ESC wiring" },
      objective: "<p>Build the main body of the Hexsoon EDU450: motors on their mounts, arms, ESCs inside the arms, LED wiring and the power distribution board on the top plate, paying special attention to the position and spin direction (CW / CCW) of each motor.</p>",
      work: "<p>We started by preparing the four motors on their mounts. The front arms have <strong>orange</strong> supports and the rear arms <strong>black</strong> ones, so the orientation of the drone is easy to see.</p>" +
        "<p>The key point was putting every motor in the right position with the right spin direction: two motors turn clockwise and two counter-clockwise, and each one must match its propeller so that the drone produces the correct forces and stays stable. You can try it in the WORKBENCH tab.</p>" +
        "<p>Then we assembled the arms with the ESCs, which connect each motor to the power system and set its speed from the flight controller signal. We fixed the power distribution board on the central frame, routed the cables for the next activities and finally attached the four arms to the central body.</p>" +
        "<p>During the assembly we kept an eye on:</p>" +
        "<ul><li>The position of each motor.</li><li>The clockwise and counter-clockwise directions.</li><li>Clean cable routing, away from sharp edges and heat sources.</li><li>Secure mechanical joints.</li><li>Connectors left accessible for the next assembly steps.</li></ul>",
      media: [
        { type: "img", src: "assets/img/w1/a3-preparing-motors.jpg", caption: "Preparing the motors and the arm supports, with the assembly guide open on the laptop" },
        { type: "img", src: "assets/img/w1/a3-motor-layout.png", caption: "Motor positions and spin directions (top view, quad X layout)" },
        { type: "img", src: "assets/img/w1/a3-frame.jpg", caption: "Arms with the motors, ESC wiring and the central plates" },
        { type: "img", src: "assets/img/w1/a3-power-wiring.jpg", caption: "Power wiring under the central plate" },
        { type: "img", src: "assets/img/w1/a3-frame-done.jpg", caption: "The frame taking shape" }
      ],
      difficulties: "<p><strong>Problem:</strong> two motors were spinning in the wrong direction.</p>" +
        "<p><strong>Solution:</strong> we noticed it before mounting the propellers and reversed them by swapping the connection of their power cables (a brushless motor changes direction when two of its three wires are swapped).</p>" +
        "<p><strong>Problem:</strong> during the project we also had a <strong>power supply problem</strong>. Every subsystem of the drone depends on a stable supply.</p>" +
        "<p><strong>What we tried:</strong> we checked the battery and the cable connections and powered the system again before repeating the affected step (we did the same during the compass calibration).</p>" +
        "<p><strong>Solution:</strong> we replaced the power supply; we believe the fault was in its connection. After the replacement, all the systems worked properly and stably.</p>",
      learned: "<p>We got hands-on experience building a multirotor and saw how its structure and its propulsion system are linked. A motor in the wrong place or spinning the wrong way can cause serious problems at lift-off, so motor positions, cable routing and secure connections are essential for a safe flight.</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #3: Frame assembly (part 1)", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450#actividad-3-montaje-de-la-carcasa-parte-1" }
      ]
    },
    {
      n: 4,
      short: "RADIO CONTROL",
      title: "Radio control",
      date: "2026-09-16",
      tags: ["radio", "OpenTX", "PWM"],
      done: true,
      real: { src: "assets/img/w1/a4-taranis-setup.jpg", caption: "Our real FrSky Taranis transmitter" },
      objective: "<p>Charge and calibrate the radio transmitter, create a model (roll, pitch, throttle and yaw on channels 1-4, switches on channels 5-7), bind it to the receiver and test the motors through the receiver PWM outputs.</p>",
      work: "<p>We worked with the <strong>FrSky Taranis</strong> transmitter and the receiver supplied with the kit. The transmitter sends the pilot's commands to the receiver by radio, and each channel carries one function: roll, pitch, throttle and yaw on channels 1-4, and the switches on the following channels.</p>" +
        "<p>Following the guide, we used <strong>OpenTX Companion</strong> to create a model for the transmitter, assign the channels, test the configuration and save it. Then we bound the transmitter to the receiver with the right radio protocol.</p>" +
        "<p>Finally we checked that every stick and switch moved the right channel in the right direction: a wrong channel assignment or a reversed control can make a drone hard, or even dangerous, to fly. The guide also uses a servo for this test, but we did not use it. Play with the sticks in the TRANSMITTER tab.</p>",
      media: [
        { type: "img", src: "assets/img/w1/a4-taranis-setup.jpg", caption: "Setting up the FrSky Taranis transmitter next to the drone frame" },
        { type: "img", src: "assets/img/w1/a4-radio-laptop.jpg", caption: "Configuring the radio with the guide open on the laptop" },
        { type: "img", src: "assets/img/w1/a4-taranis-frame.jpg", caption: "The Taranis transmitter next to the drone frame" }
      ],
      difficulties: "<p><strong>Problem:</strong> we could not pair the transmitter with the receiver.</p>" +
        "<p><strong>Solution:</strong> while reviewing the channel set-up we switched to a different transmitter and receiver combination, and with that set-up the pairing worked.</p>",
      learned: "<p>We learned how the pilot's commands reach the aircraft and how each radio channel is mapped to a function, and why every control input has to be checked before a flight.</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #4: Radio control", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450#actividad-4-radio-control" },
        { t: "OpenTX Companion", url: "https://www.open-tx.org/" }
      ]
    },
    {
      n: 5,
      short: "AUTOPILOT",
      title: "The autopilot",
      date: "2026-09-16",
      tags: ["autopilot", "Mission Planner", "calibration"],
      done: true,
      real: { src: "assets/img/w1/a5-compass-config.jpg", caption: "Configuring the real autopilot in Mission Planner" },
      objective: "<p>Connect the receiver and the GPS to the Orange Cube autopilot, install Mission Planner and the ArduCopter firmware, set the initial parameters, calibrate accelerometer, compass and radio, and configure the flight modes.</p>",
      work: "<p>We connected the Orange Cube autopilot to Mission Planner. The autopilot reads the sensors and computes the signals that keep the drone stable. Following the guide, we installed the ArduCopter firmware, set the initial parameters and did the calibrations:</p>" +
        "<ul><li>Accelerometer calibration.</li><li>Compass calibration.</li><li>Radio calibration.</li><li>Flight mode configuration.</li></ul>" +
        "<p>The guide proposes three initial flight modes:</p>" +
        "<ul>" +
        "<li><strong>AltHold:</strong> keeps the altitude using the onboard sensors.</li>" +
        "<li><strong>Loiter:</strong> uses the GPS to hold the position and the altitude.</li>" +
        "<li><strong>RTL (Return to Launch):</strong> flies the drone back to its take-off point, at the recommended return altitude of 7 m.</li>" +
        "</ul>" +
        "<p>In the full parameter list we checked <strong>RTL_ALT = 700 cm</strong> (7 m), the value recommended by the guide. For our flight in the DroneLab we finally set switch SB to <strong>Loiter / Loiter / Land</strong> (see activity 8).</p>",
      media: [
        { type: "img", src: "assets/img/w1/a5-parameters.jpg", caption: "Full parameter list in Mission Planner: RTL_ALT set to 700 cm (7 m)" },
        { type: "img", src: "assets/img/w1/a5-compass-config.jpg", caption: "Compass configuration in Mission Planner with the GPS/compass module connected to the Cube" },
        { type: "img", src: "assets/img/w1/a5-compass-problem.png", wide: true, caption: "The compass calibration problem and how we solved it" },
        { type: "video", src: "assets/video/a5-compass-outdoors.mp4", caption: "The solution: calibrating the compass outdoors with slow, smooth movements" },
        { type: "video", src: "assets/video/a5-autopilot-bench.mp4", caption: "The autopilot on the bench with the GPS/compass and the receiver, during the set-up in Mission Planner" },
        { type: "video", src: "assets/video/a5-calibration-session.mp4", caption: "Calibration session with the transmitter, the Orange Cube and the guide on the laptop" }
      ],
      difficulties: "<p><strong>Problem:</strong> the compass calibration. The compass gives the heading to the flight controller, and a bad calibration or magnetic interference affects navigation and position hold. In Mission Planner, the compass of GPS2 would not calibrate in sync with GPS1.</p>" +
        "<p><strong>What we tried:</strong> we powered the drone off and on again and repeated the calibration, and then we tried it outdoors.</p>" +
        "<p><strong>Solution:</strong> calibrating outdoors, moving the drone slowly and smoothly. That worked.</p>",
      learned: "<p>Working with a real autopilot taught us that the default configuration is not enough: every sensor has to be checked, because a bad compass calibration directly affects how ready the drone is to fly. Troubleshooting is part of preparing an unmanned aircraft.</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #5: The autopilot", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450#actividad-5-el-autopiloto" },
        { t: "Mission Planner installation (ArduPilot docs)", url: "https://ardupilot.org/planner/docs/mission-planner-installation.html" }
      ]
    },
    {
      n: 6,
      short: "FRAME ASSEMBLY 2",
      title: "Frame assembly (part 2)",
      date: "2026-09-17",
      tags: ["assembly", "wiring"],
      done: true,
      real: { src: "assets/img/hangar/detail-cube.jpg", caption: "The real wiring: Orange Cube on its carrier board and the receiver" },
      objective: "<p>Finish the airframe: centre the autopilot on the top plate, connect receiver and power, connect the motors to the MAIN OUT ports and install the GPS, the telemetry radio and the battery straps.</p>",
      work: "<p>With the mechanical structure built, we installed the rest of the electronics (try it in the WIRING BENCH tab):</p>" +
        "<ul>" +
        "<li>The <strong>Orange Cube</strong> was mounted on the frame and the four motor cables were connected to its outputs.</li>" +
        "<li>The <strong>radio receiver</strong> was connected to the autopilot, so the flight controller can read the transmitter's commands.</li>" +
        "<li>The <strong>GPS and compass</strong> module went on its support above the frame, away from the electrical components that can cause magnetic interference.</li>" +
        "<li>The <strong>telemetry radio</strong> was connected to link the drone with Mission Planner.</li>" +
        "</ul>" +
        "<p>Finally we tidied and secured all the cables and components, to avoid loose connections and keep the wires away from moving parts.</p>" +
        "<p>Our checks: autopilot orientation, motor output order, GPS position, telemetry connections, battery placement and cable routing, and mechanical protection of the electronics.</p>",
      media: [
        { type: "img", src: "assets/img/w1/a6-bench.jpg", caption: "Cube autopilot, GPS/compass, receiver and battery connected on the bench" },
        { type: "img", src: "assets/img/w1/a6-wiring.jpg", caption: "Electronics integration: wiring in the central frame, with the GPS/compass on its mast" },
        { type: "img", src: "assets/img/w1/a6-assembled.jpg", caption: "The assembled drone with the GPS/compass on its mast, next to the Taranis transmitter" }
      ],
      difficulties: "<p>No major problems in this activity: all the electronics went in and connected as planned.</p>",
      learned: "<p>We saw how the subsystems are physically integrated: even components that are well configured on their own will not work if they are badly connected or installed. Correct wiring, reliable power connections and securely mounted components are what make the drone work properly.</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #6: Frame assembly (part 2)", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450#actividad-6-montaje-de-la-carcasa-parte-2" }
      ]
    },
    {
      n: 7,
      short: "CALIBRATIONS",
      title: "More calibrations",
      date: "2026-09-17",
      tags: ["calibration", "failsafe", "ESC"],
      done: true,
      objective: "<p>Leave the platform ready to fly: telemetry radio, ESC calibration, failsafe and arm/disarm, battery monitor, motor test and the recommended parameters for the Hexsoon EDU450.</p>",
      work: "<p>This was the last configuration step before flying. Following the guide, we:</p>" +
        "<ol>" +
        "<li>Configured the telemetry radio.</li>" +
        "<li>Calibrated the ESCs, so that all of them read the throttle range in the same way and the autopilot can control the four motors consistently.</li>" +
        "<li>Configured arming and disarming.</li>" +
        "<li>Set the radio failsafe: if the link with the transmitter is lost, the drone returns to launch (RTL). The failsafe PWM threshold must stay clearly below the minimum throttle value, otherwise the autopilot shows a pre-arm error. See how it works in the CALIBRATION LAB tab.</li>" +
        "<li>Configured the battery monitor.</li>" +
        "<li>Tested the motors.</li>" +
        "<li>Loaded the parameters recommended for the Hexsoon EDU 450.</li>" +
        "<li>Ran the final configuration checks.</li>" +
        "</ol>" +
        "<p><strong>Motor test result:</strong> we ran the motor test from Mission Planner and all four motors passed. They started in sync with each other and every one turned in the correct direction.</p>" +
        "<div class=\"table-wrap\"><table><thead><tr><th>Motor</th><th>Result</th><th>Starts in sync</th><th>Direction</th></tr></thead><tbody>" +
        "<tr><td>Motor 1 (front right, CCW)</td><td>Passed</td><td>Yes</td><td>Correct</td></tr>" +
        "<tr><td>Motor 2 (rear left, CCW)</td><td>Passed</td><td>Yes</td><td>Correct</td></tr>" +
        "<tr><td>Motor 3 (front left, CW)</td><td>Passed</td><td>Yes</td><td>Correct</td></tr>" +
        "<tr><td>Motor 4 (rear right, CW)</td><td>Passed</td><td>Yes</td><td>Correct</td></tr>" +
        "</tbody></table></div>",
      media: [],
      difficulties: "<p>No major problems in this activity: all the calibrations went through and the four motors passed the motor test.</p>",
      learned: "<p>An assembled drone is not automatically ready to fly. Final calibrations, safety settings and systematic testing are what turn a set of components into a safe aircraft.</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #7: More calibrations", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450#actividad-7-m%C3%A1s-calibraciones" },
        { t: "Recommended parameter file (Hexsoon-edu450.param)", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450/blob/main/Hexsoon-edu450.param" }
      ]
    },
    {
      n: 8,
      short: "FLIGHT TESTS",
      title: "Flight tests at the DroneLab",
      date: "2026-09-19",
      tags: ["flight", "DroneLab", "geofence", "Loiter"],
      done: true,
      real: { src: "assets/img/w1/a8-team.jpg", caption: "The real flight day: Group 3 at the DroneLab" },
      objective: "<p>Fly our drone in the DroneLab with the radio transmitter, inside a geofence, and check, as a complete system, all the work done during the assembly and configuration.</p>",
      work: "<p>This was the big milestone of Phase 1: the first time we could see the drone as a complete system, with the propulsion, the autopilot, the radio control and the navigation sensors working together.</p>" +
        "<p>Before the flight we set up a <strong>geofence</strong>: a virtual boundary around the flying area that the drone is not allowed to leave. If it reaches the fence, the autopilot stops it, so a mistake with the sticks can never take the drone out of the safe area.</p>" +
        "<p>Switch SB was set to <strong>Loiter / Loiter / Land</strong> and we took off to <strong>7 m</strong>. These are the results of the test flight:</p>" +
        "<div class=\"table-wrap\"><table><thead><tr><th>Aspect</th><th>Result</th></tr></thead><tbody>" +
        "<tr><td>Take-off and landing</td><td>Clean lift-off and a normal landing.</td></tr>" +
        "<tr><td>Stability</td><td>Stable flight: roll, pitch and yaw stayed steady.</td></tr>" +
        "<tr><td>Response to the pilot</td><td>The drone reacted to the pilot's inputs as expected.</td></tr>" +
        "<tr><td>Altitude</td><td>Followed the pilot's commands and was held steadily in Loiter.</td></tr>" +
        "<tr><td>GPS position hold</td><td>Good positioning: Loiter worked well.</td></tr>" +
        "<tr><td>Flight modes</td><td>The mode changes happened when the pilot selected them.</td></tr>" +
        "<tr><td>Battery</td><td>The voltage stayed within a safe range.</td></tr>" +
        "<tr><td>Ground station link</td><td>The telemetry link with Mission Planner stayed connected during the whole flight.</td></tr>" +
        "<tr><td>Warnings and reliability</td><td>No critical warnings and no failures.</td></tr>" +
        "</tbody></table></div>" +
        "<p><strong>Result:</strong> the flight was a success, with a clean lift-off, a stable Loiter and a steady flight. Watch it in the video below, and try it yourself in the FLIGHT SIM tab: draw your own geofence first, then take off.</p>",
      media: [
        { type: "video", src: "assets/video/a8-flight.mp4", poster: "assets/img/w1/a8-flight-poster.jpg", caption: "Our drone flying inside the DroneLab net, with the pilot on the Taranis and Mission Planner on the laptop" },
        { type: "img", src: "assets/img/w1/a8-powered.jpg", caption: "Powered on at the DroneLab, with the GPS status LED lit, ready for the pre-flight checks" },
        { type: "img", src: "assets/img/w1/a8-top.jpg", caption: "Top view before the flight: acrylic plate, Orange Cube, Here3 GPS and the Taranis transmitter" },
        { type: "img", src: "assets/img/w1/a8-team.jpg", caption: "Group 3 at the DroneLab with our drone and the Taranis transmitter" },
        { type: "img", src: "assets/img/w1/a8-team2.jpg", caption: "The four of us after the flight, with the drone and the transmitter" },
        { type: "img", src: "assets/img/w1/a8-ground-station.jpg", caption: "Working at the ground station laptop" }
      ],
      difficulties: "<p>No major problems in this activity: the drone took off, held its position and landed as expected.</p>",
      learned: "<p>Seeing the drone take off, hold its position in Loiter and land was the proof that the assembly and the configuration were right: every earlier step showed up in the flight. The geofence showed us that safety is planned before take-off, not during the flight.</p>",
      links: [
        { t: "Hexsoon EDU450 guide - Activity #8: Simulator, geofences and mission planning", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450#actividad-8-simulador-geofences-y-planificaci%C3%B3n-de-misiones" },
        { t: "SITL simulator in Mission Planner (video)", url: "https://www.youtube.com/watch?v=1BPK29MOLlg" },
        { t: "Geofence and mission planning (video)", url: "https://www.youtube.com/watch?v=g-UfZ4gamq8" }
      ]
    }
  ],

  /* HANGAR: the real drone. Photo with hotspots (x / y in % of the photo),
     a 3D model (hangar.js) and a short walk-around video. */
  hangar: {
    intro: "<p>Pixels are fun, but this is the real thing: the Hexsoon EDU 450 that we built, ready to fly (without propellers). Explore the photo, spin the 3D model or watch the walk-around video.</p>",
    parts: "assets/img/hangar/parts/",
    photo: { src: "assets/img/hangar/drone.jpg", alt: "Our Hexsoon EDU 450 quadcopter on a table, seen from the side" },
    hotspots: [
      { x: 61, y: 7,  part: "gps", img: "gps.jpg", credit: { text: "CubePilot Here3 product photo (IR-LOCK store)", url: "https://irlock.com/products/here3-with-istand" }, name: "Here3 GPS + compass", text: "Position and heading. It sits high on its mast, away from the power cables and motors that could disturb the compass." },
      { x: 66, y: 26, part: "mast", img: "mast.jpg", credit: { text: "CubePilot Here3 with iStand product photo (BZB UAS), cropped", url: "https://www.bzbuas.com/shop/hx4-06213-here-3-with-istand-468" }, name: "GPS mast", text: "Lifts the GPS above the frame. Its orientation must match the autopilot settings." },
      { x: 44, y: 25, part: "plate", img: "top-plate.jpg", credit: { text: "Hexsoon EDU-450, ArduPilot docs (CC BY-SA 3.0), cropped", url: "https://ardupilot.org/copter/docs/reference-frames-hexsoon-edu450.html" }, name: "Top plate (acrylic)", text: "Transparent plate that protects the autopilot and holds the GPS mast. Through it you can see the Orange Cube." },
      { x: 51, y: 35, part: "cube", img: "cube.jpg", credit: { text: "The Cube Orange, ArduPilot docs (CC BY-SA 3.0), cropped", url: "https://ardupilot.org/copter/docs/common-thecubeorange-overview.html" }, name: "Orange Cube autopilot", text: "The flight controller running ArduCopter, on its carrier board: it reads the sensors and drives the four motors." },
      { x: 42, y: 53, part: "telemetry", img: "telemetry.jpg", credit: { text: "Holybro SiK Telemetry Radio V3 product photo (holybro.com)", url: "https://holybro.com/collections/telemetry-radios/products/sik-telemetry-radio-v3" }, name: "SiK telemetry radio", text: "Holybro 433 MHz, 500 mW radio: the wireless link with Mission Planner on the laptop." },
      { x: 37, y: 60, part: "xt60", img: "xt60.jpg", credit: { text: "AMASS XT60H connector product photo (Thingbits store)", url: "https://www.thingbits.in/products/amass-xt60h-male-female-connector" }, name: "XT60 battery lead", text: "Main power connector. The LiPo battery plugs in here, under the frame." },
      { x: 50, y: 61, part: "frame", img: "frame-pdb.jpg", credit: { text: "Hexsoon EDU-450, ArduPilot docs (CC BY-SA 3.0), cropped", url: "https://ardupilot.org/copter/docs/reference-frames-hexsoon-edu450.html" }, name: "Central frame + PDB", text: "Carbon plates of the Hexsoon frame. The power distribution board between them feeds the ESCs and the autopilot through the red power wires." },
      { x: 61, y: 53, part: "clamp", img: "clamp.jpg", credit: { text: "Hexsoon EDU-450 V2 product photo (World Drone Market), cropped", url: "https://www.worldronemarket.com/product/hexsoon-edu-450-drone-frame-v2/" }, name: "Arm clamp", text: "The orange blocks hold the carbon-tube arms to the central frame." },
      { x: 77, y: 49, part: "receiver", img: "receiver.jpg", credit: { text: "FrSky Archer R8 PRO product photo (frsky-rc.com), cropped", url: "https://www.frsky-rc.com/archer-r8-pro/" }, name: "Radio receiver (FrSky Archer R8 PRO)", text: "FrSky Archer R8 PRO receiver, under the frame: it listens to the Taranis transmitter. The marker is on one of its two thin antennas." },
      { x: 12, y: 44, part: "motor", img: "motor.jpg", credit: { text: "T-MOTOR AIR2216 II product photo (store.tmotor.com), cropped", url: "https://store.tmotor.com/goods.php?id=1220" }, name: "Brushless motor", text: "One of the four AIR 2216 motors. Each one has its own ESC and a fixed spin direction (CW or CCW)." },
      { x: 84, y: 72, part: "mount", img: "front-mount.jpg", credit: { text: "Hexsoon EDU-450 V2 product photo (World Drone Market), cropped", url: "https://www.worldronemarket.com/product/hexsoon-edu-450-drone-frame-v2/" }, name: "Front arm (orange mount)", text: "Orange mounts mark the front arms, black ones the rear arms, so the orientation is visible from far away. The motor wires come out of the mount." },
      { x: 14, y: 84, part: "leg", img: "leg.jpg", credit: { text: "Hexsoon EDU-450, ArduPilot docs (CC BY-SA 3.0), cropped", url: "https://ardupilot.org/copter/docs/reference-frames-hexsoon-edu450.html" }, name: "Landing leg", text: "Long carbon legs keep the frame and the battery clear of the ground at take-off and landing." }
    ],
    video: { src: "assets/video/hangar-walkaround.mp4", poster: "assets/img/hangar/poster.jpg", caption: "Walk-around of our drone, ready for its flight tests" }
  },

  /* Inventory: kit components. Fill in "where" and "price". */
  kit: [
    { item: "Hexsoon EDU450 frame", contents: "Plates, arms, legs, joiners, camera / laser / optical flow mount, battery belts", fn: "Airframe that holds every component", where: "", price: "" },
    { item: "Brushless motors (x4)", contents: "", fn: "Spin the propellers to generate thrust", where: "", price: "" },
    { item: "ESCs (x4)", contents: "", fn: "Electronic speed controllers: turn the autopilot PWM signal into motor power", where: "", price: "" },
    { item: "Power distribution board", contents: "", fn: "Distributes battery power to ESCs, autopilot and LEDs", where: "", price: "" },
    { item: "FrSky Taranis transmitter + receiver", contents: "Transmitter, battery, receiver, cables, neck strap", fn: "Manual control of the drone", where: "", price: "" },
    { item: "Orange Cube autopilot", contents: "Autopilot, power adapter, USB cable, POWER2 cable, buzzer", fn: "Flight controller running ArduCopter", where: "", price: "" },
    { item: "Here3 GPS + compass", contents: "", fn: "Position and heading (needed for Loiter, RTL and missions)", where: "", price: "" },
    { item: "SiK telemetry radio kit", contents: "Two radios and cables", fn: "Wireless link between autopilot and Mission Planner", where: "", price: "" },
    { item: "Servo", contents: "", fn: "Actuator controlled from a radio channel (in the kit, not used by us)", where: "", price: "" },
    { item: "UBEC + T adapter", contents: "", fn: "Power the receiver from the battery during the radio tests", where: "", price: "" },
    { item: "LiPo battery", contents: "", fn: "Powers the drone: motors, ESCs and autopilot", where: "", price: "" },
    { item: "Battery checker", contents: "", fn: "Checks the voltage of each battery cell", where: "", price: "" },
    { item: "Landing pad", contents: "", fn: "Target for the basic mission", where: "", price: "" },
    { item: "Raspberry Pi kit", contents: "RPi, camera, cables, WiFi adapter, SD cards", fn: "On-board computer (phase 2)", where: "", price: "" },
    { item: "Tool box", contents: "Scissors, tweezers, keys, screwdrivers, pliers, Allen keys", fn: "Assembly tools", where: "", price: "" }
  ],

  /* The 11 objects inside the kit box (transversal project guide, activity 2).
     Used by the interactive unboxing in World 1. */
  unboxing: [
    { name: "White box (Hexsoon frame)", icon: "whitebox", contents: "3 plates (2 black, 1 transparent), 4 arms, 4 long legs, camera / laser / optical flow mount, joiners, USB-to-TTL cable, 2 battery belts" },
    { name: "Radio", icon: "radio", contents: "Transmitter, battery, receiver, receiver-to-autopilot cable, USB cable, neck strap" },
    { name: "Autopilot", icon: "cube", contents: "Orange Cube, power adapter, USB cable, POWER2 cable, buzzer, cable to the Raspberry Pi" },
    { name: "LiPo battery", icon: "lipo", contents: "The battery that powers the drone" },
    { name: "Battery checker", icon: "checker", contents: "Shows the voltage of every LiPo cell" },
    { name: "Landing pad", icon: "pad", contents: "Target for the basic mission" },
    { name: "Raspberry Pi kit", icon: "rpi", contents: "Raspberry Pi, connectors, camera with ribbon cables, Ethernet, power and HDMI cables, WiFi adapter, SD and microSD cards" },
    { name: "GPS + compass", icon: "gps", contents: "GPS receiver with compass" },
    { name: "Telemetry radio kit", icon: "telem", contents: "Two radios, cable to the autopilot, USB cable to the laptop" },
    { name: "Black box", icon: "blackbox", contents: "4 motors, 4 ESCs, 4 extension cables, power distribution board, screws and nuts, support columns, GPS support, UBEC, T adapter, servo" },
    { name: "Tool box", icon: "tools", contents: "Scissors, tweezers, key set, screwdriver set, pliers, Allen keys" }
  ],

  /* Troubleshooting: one entry per problem. */
  difficulties: [
    /* { activity: 3, problem: "", cause: "" (optional), solution: "" } */
    { activity: 1, problem: "Hard to see how all the parts of the drone work together", cause: "", solution: "We split the drone into subsystems (propulsion, power, control, navigation and communication) and studied each one before connecting them." },
    { activity: 3, problem: "Two motors spun in the wrong direction", cause: "", solution: "We noticed it before mounting the propellers and reversed them by swapping the connection of their power cables." },
    { activity: 4, problem: "The transmitter would not pair with the receiver", cause: "", solution: "We switched to a different transmitter and receiver combination, and the pairing worked." },
    { activity: 5, problem: "The compass of GPS2 would not calibrate in sync with GPS1 in Mission Planner", cause: "", solution: "Powering the system again and repeating the calibration indoors did not help. Calibrating outdoors, with slow and smooth movements, did." },
    { activity: "Whole project", problem: "Power supply problem", cause: "We believe the fault was in the connection of the power supply.", solution: "We first checked the battery and cable connections and powered the system again. In the end we replaced the power supply, and after that every system worked properly and stably." }
  ],

  phase2: {
    unmannedAircraft: "<p>Phase 1 left us with a drone that flies and that we know inside out. From <strong>Unmanned Aircraft</strong> we want to move from manual flights to autonomous ones: missions planned in Mission Planner, such as automated scanning missions over an area, always inside a geofence like the one we used in our first flight.</p>",
    payload: "<p>From <strong>Payload</strong> we want to give the drone an onboard computer: the Raspberry Pi of our kit with its camera, connected to the autopilot. With it we could process the images taken during the flight, for example to detect objects, and explore other sensors that extend what the drone can do.</p>"
  },

  reflection: {
    learning: "<p>Phase 1 was an important milestone for us. We went from learning what the parts of a drone are to assembling, configuring and flying a complete quadcopter.</p>" +
      "<p>Along the way we found technical problems (motors spinning the wrong way, a radio that would not pair, a compass that would not calibrate, a power supply that failed) that forced us to investigate instead of just following the instructions. That taught us the value of careful assembly, correct sensor calibration, reliable electrical connections and systematic testing.</p>" +
      "<p>Our main lessons:</p><ul>" +
      "<li><strong>A drone is a system of subsystems.</strong> Propulsion, power, control, navigation and communication must all work together.</li>" +
      "<li><strong>Preparation saves time.</strong> Sorting the components before the assembly avoids wiring errors.</li>" +
      "<li><strong>Orientation matters.</strong> Motor position, spin direction and propellers must be right before the first flight.</li>" +
      "<li><strong>Verify every input.</strong> Radio channels and control directions are tested before flying.</li>" +
      "<li><strong>Do not trust the defaults.</strong> Sensor calibration, the compass above all, has to be checked.</li>" +
      "<li><strong>Assembled is not ready.</strong> Calibrations, safety settings and systematic tests come before any flight.</li>" +
      "</ul>",
    teamwork: "<p>We did not split the work into roles: the four of us did every activity together, from opening the box to the first flight. This way everyone understands the whole drone, and when a problem appeared we solved it between all of us.</p>",
    improvements: "<p>Document our work (photos, videos and results) as we go, not at the end, and use what we learned in Phase 1 as the base for the autonomous flight and payload activities of the next phases.</p>"
  },

  /* Glossary, shown in the library. */
  glossary: [
    { term: "CW / CCW", def: "Clockwise or counter-clockwise spin of a motor or propeller." },
    { term: "ESC", def: "Electronic Speed Controller: controls the speed of a brushless motor." },
    { term: "Failsafe", def: "Automatic response triggered when an important condition, such as the radio link, is lost." },
    { term: "GCS", def: "Ground Control Station: the computer and software (Mission Planner) used to monitor and command the drone." },
    { term: "Geofence", def: "Virtual boundary around the flying area that the drone is not allowed to leave." },
    { term: "GPS", def: "Global Positioning System: gives the position of the aircraft." },
    { term: "Alt Hold", def: "Flight mode that keeps the altitude steady using the onboard sensors." },
    { term: "Loiter", def: "Flight mode that uses the GPS to keep the drone's position and altitude." },
    { term: "Land", def: "Flight mode that brings the drone down where it is and stops the motors on the ground." },
    { term: "PDB", def: "Power Distribution Board: shares the battery power between the components." },
    { term: "PWM", def: "Pulse Width Modulation: the signal format that carries motor and radio control values." },
    { term: "RTL", def: "Return to Launch: a flight mode or failsafe action that sends the drone back to its launch point." },
    { term: "Telemetry", def: "Radio link that carries flight data between the drone and the ground station." }
  ],

  references: [
    { t: "Guia Hexsoon EDU450 (dronsEETAC, GitHub)", url: "https://github.com/dronsEETAC/GuiaHexsoonEDU450" },
    { t: "Transversal project guide 2024-2025 (course material)", url: "" },
    { t: "ArduPilot Copter documentation", url: "https://ardupilot.org/copter/" },
    { t: "Mission Planner documentation", url: "https://ardupilot.org/planner/" },
    { t: "OpenTX", url: "https://www.open-tx.org/" },
    { t: "Component photos in the HANGAR: official product photos from CubePilot, Holybro, FrSky, T-MOTOR, AMASS and Hexsoon (each one credited on its card)", url: "" },
    { t: "Hexsoon EDU-450 and Cube Orange images: ArduPilot documentation (CC BY-SA 3.0)", url: "https://ardupilot.org/copter/docs/reference-frames-hexsoon-edu450.html" },
    { t: "LiPo battery photo: Daniel van den Ouden, Wikimedia Commons (CC BY 2.0)", url: "https://commons.wikimedia.org/wiki/File:Lithium-polymer_battery_(3629206176).jpg" },
    { t: "Fonts: Press Start 2P and VT323 (Google Fonts, SIL Open Font License)", url: "https://fonts.google.com/" }
  ]
};
