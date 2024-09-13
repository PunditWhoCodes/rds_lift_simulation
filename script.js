document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate');
    const floorsContainer = document.getElementById('floors-container');
    const liftsContainer = document.getElementById('lifts-container');

    let floors, lifts, liftStates;
    let floorStates = {}; 

    function initializeLiftStates(numLifts) {
        return Array(numLifts).fill().map((_, index) => ({
            id: index,
            currentFloor: 0,
            targetFloors: [],
            isMoving: false,
            doorsOpen: false,
            direction: 'idle' 
        }));
    }

    function findNearestAvailableLift(floorNumber, direction) {
        let nearestLift = -1;
        let minDistance = Infinity;

        for (let i = 0; i < lifts; i++) {
            const lift = liftStates[i];
            const distance = Math.abs(lift.currentFloor - floorNumber);
            if (!lift.isMoving && !lift.doorsOpen && distance < minDistance) {
                minDistance = distance;
                nearestLift = i;
            }
        }

        return nearestLift;
    }

    function requestLift(floorNumber, direction) {
        if (!floorStates[floorNumber]) {
            floorStates[floorNumber] = { up: false, down: false };
        }
        
        
        if (floorStates[floorNumber][direction]) {
            console.log(`A lift has already been called for floor ${floorNumber+1} in the ${direction} direction.`);
            return;
        }

        const liftsOnFloor = liftStates.filter(lift => 
            lift.currentFloor === floorNumber || lift.targetFloors.includes(floorNumber)
        ).length;

        if (liftsOnFloor >= 2) {
            console.log(`Maximum number of lifts already called to floor ${floorNumber+1}`);
            return;
        }

        const availableLift = findNearestAvailableLift(floorNumber, direction);
        if (availableLift !== -1) {
            const lift = liftStates[availableLift];
            if (!lift.targetFloors.includes(floorNumber)) {
                lift.targetFloors.push(floorNumber);
                lift.direction = direction;
                floorStates[floorNumber][direction] = true; 
                if (!lift.isMoving) {
                    moveLift(availableLift);
                }
            }
        }
    }

    function animateLiftMovement(liftIndex, targetFloor, moveTime) {
        return new Promise(resolve => {
            const liftElement = document.querySelector(`.lift-shaft:nth-child(${liftIndex + 1}) .lift`);
            const floorHeight = 100; 
            const targetPosition = (floors - 1 - targetFloor) * floorHeight;

            liftElement.style.transition = `top ${moveTime}ms linear`;
            liftElement.style.top = `${targetPosition}px`;

            setTimeout(resolve, moveTime);
        });
    }

    function openCloseDoors(liftIndex) {
        return new Promise(resolve => {
            const liftElement = document.querySelector(`.lift-shaft:nth-child(${liftIndex + 1}) .lift`);
            const leftDoor = liftElement.querySelector('.lift-door.left');
            const rightDoor = liftElement.querySelector('.lift-door.right');

            
            leftDoor.classList.add('open');
            rightDoor.classList.add('open');

            
            setTimeout(() => {
                
                leftDoor.classList.remove('open');
                rightDoor.classList.remove('open');

                
                setTimeout(resolve, 2000);
            }, 2000);
        });
    }

    async function moveLift(liftIndex) {
        const lift = liftStates[liftIndex];
        lift.isMoving = true;

        while (lift.targetFloors.length > 0) {
            const targetFloor = lift.targetFloors[0];
            const floorsToMove = Math.abs(targetFloor - lift.currentFloor);
            const moveTime = floorsToMove * 1000; 

            await animateLiftMovement(liftIndex, targetFloor, moveTime);
            lift.currentFloor = targetFloor;

           
            await openCloseDoors(liftIndex);

            lift.targetFloors.shift();

            
            if (floorStates[targetFloor]) {
                floorStates[targetFloor] = { up: false, down: false };
            }

            
            if (floorStates[lift.currentFloor] && (floorStates[lift.currentFloor].up || floorStates[lift.currentFloor].down)) {
                await openCloseDoors(liftIndex);
                floorStates[lift.currentFloor] = { up: false, down: false };
            }
        }

        lift.isMoving = false;
        lift.direction = 'idle';
    }

    generateButton.addEventListener('click', () => {
        floors = parseInt(document.getElementById('floors').value);
        lifts = parseInt(document.getElementById('lifts').value);

        if (isNaN(floors) || isNaN(lifts) || floors < 2 || lifts < 1) {
            alert('Please enter valid numbers for floors (min 1) and lifts (min 1).');
            return;
        }

        liftStates = initializeLiftStates(lifts);
        floorStates = {}; 
        floorsContainer.innerHTML = '';
        liftsContainer.innerHTML = '';

        
        for (let i = 0; i < floors; i++) {
            const floor = document.createElement('div');
            floor.className = 'floor';

            const floorNumber = document.createElement('div');
            floorNumber.className = 'floor-number';
            floorNumber.textContent = i + 1;

            const liftButtons = document.createElement('div');
            liftButtons.className = 'lift-buttons';

            if (i < floors - 1) {
                const upButton = document.createElement('button');
                upButton.className = 'lift-button';
                upButton.textContent = 'Up';
                upButton.addEventListener('click', () => requestLift(i, 'up'));
                liftButtons.appendChild(upButton);
            }

            if (i > 0) {
                const downButton = document.createElement('button');
                downButton.className = 'lift-button';
                downButton.textContent = 'Down';
                downButton.addEventListener('click', () => requestLift(i, 'down'));
                liftButtons.appendChild(downButton);
            }

            floor.appendChild(floorNumber);
            floor.appendChild(liftButtons);
            floorsContainer.appendChild(floor);
        }

        
        for (let i = 0; i < lifts; i++) {
            const liftShaft = document.createElement('div');
            liftShaft.className = 'lift-shaft';
            liftShaft.style.height = `${floors * 100}px`; 

            const lift = document.createElement('div');
            lift.className = 'lift';

            const liftDoors = document.createElement('div');
            liftDoors.className = 'lift-doors';

            const leftDoor = document.createElement('div');
            leftDoor.className = 'lift-door left';

            const rightDoor = document.createElement('div');
            rightDoor.className = 'lift-door right';

            liftDoors.appendChild(leftDoor);
            liftDoors.appendChild(rightDoor);
            lift.appendChild(liftDoors);
            liftShaft.appendChild(lift);
            liftsContainer.appendChild(liftShaft);

            
            lift.style.top = `${(floors - 1) * 100}px`;
        }

        
        floorsContainer.style.height = `${floors * 100}px`;
        liftsContainer.style.height = `${floors * 100}px`;
        
        
        liftsContainer.style.overflowX = 'auto';
        liftsContainer.style.width = '100%';
        
        
        const minWidth = lifts * 80 + (lifts - 1) * 20; 
        liftsContainer.style.minWidth = `${minWidth}px`;
    });
});