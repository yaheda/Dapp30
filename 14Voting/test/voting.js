const Voting = artifacts.require('Voting.sol');

const { expectRevert, time } = require('@openzeppelin/test-helpers');

contract('Voting', ([deployer, voter1, voter2]) => {
  let voting;

  beforeEach(async () => {
    voting = await Voting.new();
  });

  contract('Add voters', () => {
    it('Should add voters', async () => {
      await voting.addVoters([voter1, voter2], { from: deployer });
      assert(await voting.voters(voter1) == true);
      assert(await voting.voters(voter2) == true);
    });
    it('Should not add voters if not admin', async () => {
      await expectRevert(
        voting.addVoters([voter1, voter2], { from: voter1 }),
        'Ownable: caller is not the owner'
      );
    });
  });

  contract('Create Ballot', () => {
    it('Should create ballot', async () => {
      await voting.createBallot('dividends', ['increase', 'reduce', 'leave'], 5);
      var ballot = await voting.ballots(0);
      assert(ballot[0] == '0');
      assert(ballot[1] == 'dividends');
      //assert(ballot[2] == '0'); --> compare array
    });
    it('Should not create nallot is not admin', async () => {
      await expectRevert(
        voting.createBallot('dividends', ['increase', 'reduce', 'leave'], 5, { from: voter1 }),
        'Ownable: caller is not the owner'
      );
    });
  });

  contract('Vote', () => {
    it('Should vote', async () => {
      await voting.addVoters([voter1, voter2], { from: deployer });
      await voting.createBallot('dividends', ['increase', 'reduce', 'leave'], 5);

      await voting.vote(0, 0, { from: voter1 });
      await voting.vote(0, 0, { from: voter2 });

      var voted1 = await voting.votes(voter1, 0);
      var voted2 = await voting.votes(voter2, 0);
      assert(voted1 == true);
      assert(voted2 == true);

      await time.increase(6000);

      var results = await voting.results(0);
      assert(results[0].votes == '2');
      assert(results[1].votes == '0');
      assert(results[2].votes == '0');

    });
    it('Should not vote if not voter', async () => {
      await voting.addVoters([voter1, voter2], { from: deployer });
      await voting.createBallot('dividends', ['increase', 'reduce', 'leave'], 5);

      await expectRevert(
        voting.vote(0, 0, { from: deployer }),
        'only voter'
      );
    });
    it('Should not vote if already voted', async () => {
      await voting.addVoters([voter1, voter2], { from: deployer });
      await voting.createBallot('dividends', ['increase', 'reduce', 'leave'], 5);

      await voting.vote(0, 0, { from: voter1 })

      await expectRevert(
        voting.vote(0, 0, { from: voter1 }),
        'can only vote once'
      );
    });
    it('Should not vote if ballot has ended', async () => {
      await voting.addVoters([voter1, voter2], { from: deployer });
      await voting.createBallot('dividends', ['increase', 'reduce', 'leave'], 5);

      //await new Promise(resolve => setTimeout(resolve, 6000));
      await time.increase(6000);

      await expectRevert(
        voting.vote(0, 0, { from: voter1 }),
        'ballot has ended'
      );
    });
  });
});