# Personalize에 저장하는 DataSet의 Schema 정의

[cdk-emotion-garden](https://github.com/kyopark2014/emotion-garden/blob/main/cdk-emotion-garden/lib/cdk-emotion-garden-stack.ts)에서는 DataSet에 대한 Schema를 정의합니다.

## Interaction

```java
const interactionSchemaJson = `{
  "type": "record",
  "name": "Interactions",
  "namespace": "com.amazonaws.personalize.schema",
  "fields": [
    {
      "name": "USER_ID",
      "type": "string"
    },
    {
      "name": "ITEM_ID",
      "type": "string"
    },
    {
      "name": "TIMESTAMP",
      "type": "long"
    },
    { 
      "name": "EVENT_TYPE",
      "type": "string"
    },
    {
      "name": "IMPRESSION",
      "type": "string"
    }
  ],
  "version": "1.0"
}`;
const interactionSchema = new personalize.CfnSchema(this, 'InteractionSchema', {
  name: 'emotion-garden-interaction-schema',
  schema: interactionSchemaJson,
});

const interactionDataset = new personalize.CfnDataset(this, 'InteractionDataset', {
  datasetGroupArn: datasetGroup.attrDatasetGroupArn,
  datasetType: 'Interactions',
  name: 'emotion-garden-interaction-dataset',
  schemaArn: interactionSchema.attrSchemaArn,
});
```
