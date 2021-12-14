import { addNewStandaloneDatabase } from '../../../helpers/database';
import { WorkbenchPage } from '../../../pageObjects/workbench-page';
import { MyRedisDatabasePage, UserAgreementPage, AddRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';

const myRedisDatabasePage = new MyRedisDatabasePage();
const userAgreementPage = new UserAgreementPage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

const indexName = 'idx';
const commandsForIndex = [
    `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA price NUMERIC SORTABLE`,
    'HMSET product:1 price 20',
    'HMSET product:2 price 100'
];

fixture `Command results at Workbench`
    .meta({type: 'regression'})
    .page(commonUrl)
    .beforeEach(async t => {
        await t.maximizeWindow();
        await userAgreementPage.acceptLicenseTerms();
        await t.expect(addRedisDatabasePage.addDatabaseButton.exists).ok('The add redis database view', {timeout: 20000});
        await addNewStandaloneDatabase(ossStandaloneConfig);
        //Connect to DB
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        //Add index and data
        await t.click(myRedisDatabasePage.workbenchButton);
        for(let command of commandsForIndex) {
            await workbenchPage.sendCommandInWorkbench(command);
        }
    })
    .afterEach(async t => {
        //Drop index and dbs
        await workbenchPage.sendCommandInWorkbench('FT.DROPINDEX products DD');
        await myRedisDatabasePage.deleteAllDatabases();
    })
//skipped due the inaccessibility of the iframe
test.skip('Verify that user can switches between Table and Text for FT.INFO and see results corresponding to their views', async t => {
    const infoCommand = `FT.INFO ${indexName}`;
    //Send FT.INFO and switch to Text view
    await workbenchPage.sendCommandInWorkbench(infoCommand);
    await workbenchPage.selectViewTypeText();
    await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).exists).ok(`The text view is switched for command FT.INFO`);
    //Switch to Table view and check result
    await workbenchPage.selectViewTypeTable();
    await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTableResult).exists).ok(`The table view is switched for command FT.INFO`);
});
//skipped due the inaccessibility of the iframe
test.skip('Verify that user can switches between Table and Text for FT.SEARCH and see results corresponding to their views', async t => {
    const searchCommand = `FT.SEARCH ${indexName} *`;
    //Send FT.SEARCH and switch to Text view
    await workbenchPage.sendCommandInWorkbench(searchCommand);
    await workbenchPage.selectViewTypeText();
    await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).visible).ok(`The text view is switched for command FT.SEARCH`);
    //Switch to Table view and check result
    await workbenchPage.selectViewTypeTable();
    await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTableResult).exists).ok(`The table view is switched for command FT.SEARCH`);
});
//skipped due the inaccessibility of the iframe
test.skip('Verify that user can switches between Table and Text for FT.AGGREGATE and see results corresponding to their views', async t => {
    const aggregateCommand = `FT.Aggregate ${indexName} * GROUPBY 0 REDUCE MAX 1 @price AS max_price`;
    //Send FT.AGGREGATE and switch to Text view
    await workbenchPage.sendCommandInWorkbench(aggregateCommand);
    await workbenchPage.selectViewTypeText();
    await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).visible).ok(`The text view is switched for command FT.AGGREGATE`);
    //Switch to Table view and check result
    await workbenchPage.selectViewTypeTable();
    await t.expect(await workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTableResult).exists).ok(`The table view is switched for command FT.AGGREGATE`);
});
