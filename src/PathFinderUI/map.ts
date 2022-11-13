import exp from "constants";

const iitkgp: boolean[][] = [
    [
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        false,
        false,
        false,
        true,
        true
    ],
    [
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        false,
        true,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        false,
        false,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false
    ],
    [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ],
    [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        false,
        false,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        true
    ]
];

export default iitkgp;