// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {

    /*//////////////////////////////////////////////////////////////
                            STATE
    //////////////////////////////////////////////////////////////*/

    address public owner;
    uint256 public proposalCount;

    /*//////////////////////////////////////////////////////////////
                            STRUCT
    //////////////////////////////////////////////////////////////*/

    struct Proposal {
        string head;
        string title;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 voteStartTime;
        uint256 voteEndTime;
        bool executed;
    }

    /*//////////////////////////////////////////////////////////////
                            STORAGE
    //////////////////////////////////////////////////////////////*/

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    /*//////////////////////////////////////////////////////////////
                            MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier votingActive(uint256 proposalId) {
        require(
            block.timestamp >= proposals[proposalId].voteStartTime &&
            block.timestamp <= proposals[proposalId].voteEndTime,
            "Voting not active"
        );
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            EVENTS
    //////////////////////////////////////////////////////////////*/

    event ProposalCreated(uint256 proposalId, string title);
    event Voted(uint256 proposalId, address voter, bool choice);

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                            FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createProposal(
        string memory _head,
        string memory _title,
        uint256 _duration
    ) external onlyOwner {

        proposalCount++;

        proposals[proposalCount] = Proposal({
            head: _head,
            title: _title,
            yesVotes: 0,
            noVotes: 0,
            voteStartTime: block.timestamp,
            voteEndTime: block.timestamp + _duration,
            executed: false
        });

        emit ProposalCreated(proposalCount, _title);
    }
    function vote(uint256 id,bool support)external votingActive(id){
        require(!hasVoted[id][msg.sender],"Already voted");
        hasVoted[id][msg.sender]= true;
        if(support){
            proposals[id].yesVotes++;
        }
        else{
            proposals[id].noVotes++;
        }
        emit Voted(id,msg.sender,support);


    }
       // get proposal result
   function getResult(
    uint256 id
) external view returns (string memory result) {

    require(
        block.timestamp > proposals[id].voteEndTime,
        "Voting still active"
    );

    if (proposals[id].yesVotes > proposals[id].noVotes) {
        return "PASSED";
    } else if (proposals[id].yesVotes < proposals[id].noVotes) {
        return "FAILED";
    } else {
        return "TIE";
    }
}

}
