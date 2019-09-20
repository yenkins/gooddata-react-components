// (C) 2019 GoodData Corporation
import get = require("lodash/get");
import { VisualizationObject } from "@gooddata/typings";
import { getMeasuresFromMdObject } from "./bucketHelper";
import * as BucketNames from "../../constants/bucketNames";
import { IAxisConfig } from "../../interfaces/Config";
import { IVisualizationProperties } from "../interfaces/Visualization";

function isAttribute(item: VisualizationObject.BucketItem): boolean {
    const attribute = item as VisualizationObject.IVisualizationAttribute;
    return attribute.visualizationAttribute !== undefined;
}

function findBucketByLocalIdentifier(buckets: VisualizationObject.IBucket[], bucketName: string) {
    return (buckets || []).find(bucket => get(bucket, "localIdentifier") === bucketName);
}

export function hasAttribute(mdObject: VisualizationObject.IVisualizationObjectContent): boolean {
    return mdObject.buckets.some(bucket => {
        return bucket.items.some(isAttribute);
    });
}

export function haveManyViewItems(mdObject: VisualizationObject.IVisualizationObjectContent): boolean {
    const viewBucket = mdObject && findBucketByLocalIdentifier(mdObject.buckets, BucketNames.VIEW);
    return viewBucket && get(viewBucket, "items").length > 1;
}

export function hasTertiaryMeasures(mdObject: VisualizationObject.IVisualizationObjectContent): boolean {
    return mdObject.buckets
        .filter(bucket => [BucketNames.TERTIARY_MEASURES].indexOf(get(bucket, "localIdentifier")) >= 0)
        .some(bucket => get(bucket, "items").length > 0);
}

export function isStacked(mdObject: VisualizationObject.IVisualizationObjectContent): boolean {
    return (
        mdObject &&
        mdObject.buckets
            .filter(
                bucket =>
                    [BucketNames.STACK, BucketNames.SEGMENT].indexOf(get(bucket, "localIdentifier")) >= 0,
            )
            .some(bucket => get(bucket, "items").length > 0)
    );
}

export function hasMeasures(mdObject: VisualizationObject.IVisualizationObjectContent): boolean {
    return mdObject && getMeasuresFromMdObject(mdObject).length > 0;
}

function isAllMeasuresOnSingleAxis(
    mdObject: VisualizationObject.IVisualizationObjectContent,
    secondaryYAxis: IAxisConfig,
): boolean {
    const measureCount = getMeasuresFromMdObject(mdObject).length;
    const numberOfMeasureOnSecondaryAxis = secondaryYAxis ? secondaryYAxis.measures.length : 0;
    return numberOfMeasureOnSecondaryAxis === 0 || measureCount === numberOfMeasureOnSecondaryAxis;
}

export function isSimpleStackMeasures(
    mdObject: VisualizationObject.IVisualizationObjectContent,
    supportedControls: IVisualizationProperties,
): boolean {
    return (
        get(supportedControls, "stackMeasures", false) &&
        isAllMeasuresOnSingleAxis(mdObject, get(supportedControls, "secondary_yaxis", false)) &&
        !haveManyViewItems(mdObject)
    );
}
