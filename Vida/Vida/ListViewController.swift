//
//  ListViewController.swift
//  Vida
//
//  Created by Ryoya Ogishima on 11/13/16.
//  Copyright © 2016 YHack16. All rights reserved.
//

import UIKit

class ListViewController: UIViewController {
    
    var i = 0
    let semaphore = DispatchSemaphore(value: 0)
    var json2 = JSON([])

    @IBOutlet weak var name: UILabel!
    @IBOutlet weak var address: UILabel!
    @IBOutlet weak var rating: UILabel!
    @IBOutlet weak var male: UILabel!
    @IBOutlet weak var female: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        self.view.backgroundColor = UIColor.white
        name.text = ""
        address.text = ""
        rating.text = ""
        male.text = ""
        female.text = ""
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func getAsync(sender: AnyObject) {
        
        // create the url-request
        let urlString = "https://vida.herokuapp.com/api/clubs"
        let request = NSMutableURLRequest(url: NSURL(string: urlString)! as URL)
        
        // set the method(HTTP-GET)
        request.httpMethod = "GET"
        
        // use NSURLSessionDataTask
        let task = URLSession.shared.dataTask(with: request as URLRequest, completionHandler: { data, response, error in
            if (error == nil) {
                let result = NSString(data: data!, encoding: String.Encoding.utf8.rawValue)!
                print(result)
                var json = JSON(data: data!)
                self.json2 = json["info"]
            } else {
                print(error as Any)
            }
            self.semaphore.signal()
        })
        task.resume()
    }

    @IBAction func initiate(_ sender: UIButton) {
        getAsync(sender: sender)
        self.semaphore.wait()
        self.name.text = json2[self.i]["name"].string
        self.address.text = json2[self.i]["address"].string
        self.rating.text = json2[self.i]["rating"].string
        self.male.text = json2[self.i]["male"].string
        self.female.text = json2[self.i]["female"].string
        i = (i+1)%(json2.count)
    }
}
